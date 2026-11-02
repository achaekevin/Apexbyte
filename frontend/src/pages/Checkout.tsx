import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiSmartphone, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiClock, FiLock, FiShield } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import { useSettings } from '../hooks/useSettings';
import TechBackground from '../components/ui/TechBackground';

// Initialize Stripe (use publishable key from env or fallback)
const stripePromise = loadStripe((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

type Step = 'shipping' | 'payment';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form data
  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Kisii',
    state: 'Nyanza',
    zipCode: '40200',
    country: 'Kenya',
  });

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod' | 'card' | 'paypal'>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');

  // M-Pesa STK Push interactive modal state
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [mpesaPollStatus, setMpesaPollStatus] = useState<'INITIATING' | 'WAITING_PIN' | 'PAID' | 'FAILED'>('INITIATING');
  const [mpesaReceipt, setMpesaReceipt] = useState<string | null>(null);
  const [mpesaCountdown, setMpesaCountdown] = useState(60);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const { settings } = useSettings();

  // Dynamic pricing and thresholds
  const freeShippingThreshold = Number(settings.free_shipping_threshold) || 50000;
  const standardShippingFee = Number(settings.shipping_fee) || 1500;
  const taxRate = (Number(settings.tax_rate_percent) || 0) / 100;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!mpesaPhone && shippingData.phone) {
      setMpesaPhone(shippingData.phone);
    }
    setCurrentStep('payment');
  };

  // Helper to construct createOrder payload
  const buildOrderPayload = (method: 'MPESA' | 'CASH_ON_DELIVERY' | 'STRIPE' | 'PAYPAL', paymentIntentId?: string) => ({
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    })),
    shippingAddress: shippingData,
    guestEmail: !user ? shippingData.email : undefined,
    guestFirstName: !user ? shippingData.firstName : undefined,
    guestLastName: !user ? shippingData.lastName : undefined,
    paymentMethod: method,
    paymentIntentId,
  });

  // Start polling M-Pesa status
  const startMpesaPolling = (checkoutRequestId: string, orderId: string) => {
    setMpesaCountdown(60);
    setMpesaPollStatus('WAITING_PIN');

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setMpesaCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          clearInterval(pollTimerRef.current!);
          setMpesaPollStatus('FAILED');
          setErrorMessage('M-Pesa payment request timed out. Please retry.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await paymentService.queryMpesaStatus(checkoutRequestId);
        if (res?.data) {
          const { status, isPaid, mpesaReceiptNumber, resultDesc } = res.data;
          if (isPaid || status === 'PAID') {
            clearInterval(pollTimerRef.current!);
            clearInterval(countdownTimerRef.current!);
            setMpesaPollStatus('PAID');
            setMpesaReceipt(mpesaReceiptNumber || 'Verified');
            clearCart();
            setTimeout(() => {
              navigate(`/order-success/${orderId}`);
            }, 2000);
          } else if (status === 'FAILED') {
            clearInterval(pollTimerRef.current!);
            clearInterval(countdownTimerRef.current!);
            setMpesaPollStatus('FAILED');
            setErrorMessage(resultDesc || 'M-Pesa payment was cancelled or declined on your device.');
          }
        }
      } catch (err) {
        // Continue polling until timeout
      }
    }, 3000);
  };

  // Retry STK Push for the existing order
  const handleRetryMpesa = async () => {
    if (!activeOrderId) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setMpesaPollStatus('INITIATING');
    try {
      const mpesaRes = await paymentService.initiateMpesa(activeOrderId, mpesaPhone);
      const reqId = mpesaRes.data.checkoutRequestId;
      startMpesaPolling(reqId, activeOrderId);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to initiate M-Pesa STK push');
      setMpesaPollStatus('FAILED');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. M-PESA
      if (paymentMethod === 'mpesa') {
        if (!mpesaPhone.trim()) {
          setErrorMessage('Please enter your Safaricom M-Pesa phone number');
          setIsProcessing(false);
          return;
        }

        // Create order first
        const orderRes: any = await orderService.createOrder(buildOrderPayload('MPESA'));
        const createdOrder = orderRes.data?.data || orderRes.data || orderRes;
        const orderId = createdOrder.id;
        setActiveOrderId(orderId);
        setShowMpesaModal(true);
        setMpesaPollStatus('INITIATING');

        // Initiate STK Push
        const mpesaRes = await paymentService.initiateMpesa(orderId, mpesaPhone);
        const reqId = mpesaRes.data.checkoutRequestId;
        startMpesaPolling(reqId, orderId);
        setIsProcessing(false);
        return;
      }

      // 2. PAY ON DELIVERY (CASH ON DELIVERY)
      if (paymentMethod === 'cod') {
        const orderRes: any = await orderService.createOrder(buildOrderPayload('CASH_ON_DELIVERY'));
        const createdOrder = orderRes.data?.data || orderRes.data || orderRes;
        clearCart();
        navigate(`/order-success/${createdOrder.id}`);
        return;
      }

      // 3. CREDIT / DEBIT CARD (STRIPE)
      if (paymentMethod === 'card') {
        if (!stripe || !elements) {
          setErrorMessage('Payment gateway is still initializing. Please try again.');
          setIsProcessing(false);
          return;
        }

        // Create order in PENDING status first
        const orderRes: any = await orderService.createOrder(buildOrderPayload('STRIPE'));
        const createdOrder = orderRes.data?.data || orderRes.data || orderRes;
        const orderId = createdOrder.id;

        // Create Stripe Intent with server-side order total enforcement
        const { clientSecret } = await paymentService.createPaymentIntent({
          amount: Math.round(total * 100),
          currency: 'kes',
          orderId,
        });

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card input element not found');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingData.firstName} ${shippingData.lastName}`,
              email: shippingData.email,
              phone: shippingData.phone,
              address: {
                line1: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.zipCode,
                country: 'KE',
              },
            },
          },
        });

        if (error) {
          setErrorMessage(error.message || 'Card payment declined');
          setIsProcessing(false);
          return;
        }

        if (paymentIntent?.status === 'succeeded') {
          clearCart();
          navigate(`/order-success/${orderId}`);
          return;
        }
      }

      // 4. PAYPAL
      if (paymentMethod === 'paypal') {
        const orderRes: any = await orderService.createOrder(buildOrderPayload('PAYPAL'));
        const createdOrder = orderRes.data?.data || orderRes.data || orderRes;
        clearCart();
        navigate(`/order-success/${createdOrder.id}`);
        return;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed. Please verify your details.';
      setErrorMessage(msg);
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 'shipping', label: 'Shipping Information', number: 1 },
    { id: 'payment', label: 'Payment Method', number: 2 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  if (items.length === 0 && !showMpesaModal) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Secure Checkout - Apexbyte Laptops Kenya</title>
      </Helmet>

      <TechBackground variant="minimal" className="min-h-screen bg-gray-50/90 dark:bg-gray-900/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-9 h-9 text-xs sm:text-sm rounded-full flex items-center justify-center font-bold transition-colors ${
                        index <= currentStepIndex
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : step.number}
                    </div>
                    <span
                      className={`text-xs sm:text-sm mt-1.5 font-semibold text-center leading-tight ${
                        index <= currentStepIndex
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 sm:mx-4 transition-colors ${
                        index < currentStepIndex
                          ? 'bg-primary-600'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Global Error Banner */}
          {errorMessage && (
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-3 text-red-800 dark:text-red-300 text-sm">
              <FiAlertCircle className="text-xl shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-bold">Checkout Alert</p>
                <p>{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-600 font-bold hover:underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Shipping Information */}
                {currentStep === 'shipping' && (
                  <motion.div
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Shipping Information</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Enter the destination for your courier delivery or rider dispatch
                          </p>
                        </div>
                        <span className="text-[11px] sm:text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <FiShield className="text-xs" /> Verified Dispatch
                        </span>
                      </div>

                      <form onSubmit={handleShippingSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              First Name *
                            </label>
                            <Input
                              required
                              placeholder="e.g. Victor"
                              value={shippingData.firstName}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  firstName: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Last Name *
                            </label>
                            <Input
                              required
                              placeholder="e.g. Ochieng"
                              value={shippingData.lastName}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  lastName: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Email Address *
                            </label>
                            <Input
                              type="email"
                              required
                              placeholder="e.g. customer@gmail.com"
                              value={shippingData.email}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Mobile Number (For Courier Call) *
                            </label>
                            <Input
                              type="tel"
                              required
                              placeholder="e.g. 0712345678"
                              value={shippingData.phone}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  phone: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1.5">
                            Physical Address / Building / Landmark *
                          </label>
                          <Input
                            required
                            placeholder="e.g. Mocha Place, Level 2, Kisii or Westlands, Nairobi"
                            value={shippingData.address}
                            onChange={(e) =>
                              setShippingData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              City / Town *
                            </label>
                            <Input
                              required
                              placeholder="Kisii"
                              value={shippingData.city}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  city: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              County / State *
                            </label>
                            <Input
                              required
                              placeholder="Kisii County"
                              value={shippingData.state}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  state: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Postal Code *
                            </label>
                            <Input
                              required
                              placeholder="40200"
                              value={shippingData.zipCode}
                              onChange={(e) =>
                                setShippingData((prev) => ({
                                  ...prev,
                                  zipCode: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/cart')}
                          >
                            Back to Cart
                          </Button>
                          <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 font-bold">
                            Proceed to Payment
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Choose Payment Method</h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Transactions are encrypted and verified via official Safaricom Daraja & PCI-DSS gateways
                          </p>
                        </div>
                        <FiLock className="text-lg sm:text-xl text-primary-600 dark:text-primary-400" />
                      </div>

                      {/* Payment Method Selector */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mpesa')}
                          className={`p-2.5 sm:p-3.5 border-2 rounded-xl text-center transition-all ${
                            paymentMethod === 'mpesa'
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                          }`}
                        >
                          <div className="text-xl sm:text-2xl mb-1">📱</div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">M-Pesa Express</div>
                          <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400">STK Push</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-2.5 sm:p-3.5 border-2 rounded-xl text-center transition-all ${
                            paymentMethod === 'cod'
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                          }`}
                        >
                          <div className="text-xl sm:text-2xl mb-1">💵</div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Pay on Delivery</div>
                          <span className="text-[11px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400">Inspect & Pay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-2.5 sm:p-3.5 border-2 rounded-xl text-center transition-all ${
                            paymentMethod === 'card'
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xl sm:text-2xl mb-1">💳</div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">Card (Stripe)</div>
                          <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">Visa / MC</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-2.5 sm:p-3.5 border-2 rounded-xl text-center transition-all ${
                            paymentMethod === 'paypal'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-xl sm:text-2xl mb-1">🅿️</div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">PayPal</div>
                          <span className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400">International</span>
                        </button>
                      </div>

                      <form onSubmit={handlePaymentSubmit}>
                        {paymentMethod === 'mpesa' && (
                          <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-2">
                              Safaricom M-Pesa Phone Number *
                            </label>
                            <Input
                              type="tel"
                              placeholder="e.g. 0712345678 or 254712345678"
                              value={mpesaPhone}
                              onChange={(e) => setMpesaPhone(e.target.value)}
                              required
                            />
                            <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-2 font-medium">
                              ✓ You will receive an instant STK push prompt on this handset to authorize {formatCurrency(total)}. Never share your PIN with anyone.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'cod' && (
                          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                            <p className="font-bold text-sm mb-1">🏬 Pay on Delivery (Kisii & Selected Regions)</p>
                            <p>
                              Our dispatch technician will bring your laptop. You have the right to unbox, inspect the hardware condition, verify specs and power it on before paying via M-Pesa or Cash.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'card' && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                              Debit / Credit Card Details
                            </label>
                            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <CardElement
                                options={{
                                  style: {
                                    base: {
                                      fontSize: '16px',
                                      color: '#1f2937',
                                      '::placeholder': { color: '#9ca3af' },
                                    },
                                    invalid: { color: '#ef4444' },
                                  },
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              Processed securely via Stripe 256-bit encryption.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'paypal' && (
                          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <p className="text-sm text-blue-900 dark:text-blue-300">
                              Confirm your order below to authorize via your PayPal wallet.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep('shipping')}
                            disabled={isProcessing}
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-primary-600 hover:bg-primary-700 font-bold"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <span className="flex items-center justify-center gap-2">
                                <FiRefreshCw className="animate-spin" /> Processing Order...
                              </span>
                            ) : paymentMethod === 'cod' ? (
                              `Confirm Order (${formatCurrency(total)} on Delivery)`
                            ) : paymentMethod === 'mpesa' ? (
                              `Send M-Pesa Prompt (${formatCurrency(total)})`
                            ) : (
                              `Pay ${formatCurrency(total)}`
                            )}
                          </Button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <img
                        src={getProductImage(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                        }}
                        className="w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-800"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Courier Shipping</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated VAT / Tax ({settings.tax_rate_percent}%)</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t border-gray-200 dark:border-gray-700 pt-3">
                    <span>Total</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <FiShield className="text-primary-600 text-sm" /> {settings.badge_warranty}
                  </p>
                  <p>{settings.badge_returns} • {settings.badge_pickup}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </TechBackground>

      {/* M-PESA STK PUSH LIVE MODAL */}
      <AnimatePresence>
        {showMpesaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center"
            >
              {mpesaPollStatus === 'INITIATING' && (
                <div>
                  <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
                    <FiRefreshCw className="animate-spin text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Connecting to Safaricom Daraja...</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Sending STK push prompt to <strong>{mpesaPhone}</strong>
                  </p>
                </div>
              )}

              {mpesaPollStatus === 'WAITING_PIN' && (
                <div>
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 animate-pulse">
                    <FiSmartphone className="text-3xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    STK Prompt Sent
                  </span>
                  <h3 className="text-xl font-extrabold mt-3 mb-1">Check Your Phone Now</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Enter your M-Pesa PIN on handset <strong>{mpesaPhone}</strong> to authorize <strong>{formatCurrency(total)}</strong>.
                  </p>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <FiClock /> Waiting for response:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                      {mpesaCountdown}s
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Do not close this window. Your order will confirm automatically once payment is verified.
                  </p>
                </div>
              )}

              {mpesaPollStatus === 'PAID' && (
                <div>
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500">
                    <FiCheckCircle className="text-4xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Payment Received!</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    M-Pesa Receipt: <strong className="font-mono text-emerald-600">{mpesaReceipt}</strong>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Redirecting to your order confirmation page...
                  </p>
                </div>
              )}

              {mpesaPollStatus === 'FAILED' && (
                <div>
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500">
                    <FiAlertCircle className="text-3xl text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Not Completed</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                    {errorMessage || 'The STK Push was cancelled or timed out. Would you like to retry or change payment method?'}
                  </p>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowMpesaModal(false)}
                    >
                      Change Method
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={handleRetryMpesa}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Resending...' : 'Retry STK Prompt'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const Checkout = () => {
  return (
    <ErrorBoundary variant="section" title="Checkout Service Encountered an Issue">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </ErrorBoundary>
  );
};

export default Checkout;
