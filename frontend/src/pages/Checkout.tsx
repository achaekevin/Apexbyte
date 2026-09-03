import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

// Initialize Stripe (use your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

type Step = 'shipping' | 'payment' | 'review';

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form data
  const [shippingData, setShippingData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Kenya',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'mpesa'>('card');
  const [saveAddress, setSaveAddress] = useState(true);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 50000 ? 0 : 1500;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: shippingData,
        paymentMethod,
        paymentIntentId,
      };
      return orderService.createOrder(orderData);
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/orders/${data.id}`, { state: { orderSuccess: true } });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create order');
      setIsProcessing(false);
    },
  });

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (paymentMethod === 'card') {
      setIsProcessing(true);

      try {
        // Create payment intent
        const { clientSecret } = await paymentService.createPaymentIntent({
          amount: Math.round(total * 100), // Convert to cents
          currency: 'usd',
        });

        // Confirm card payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: `${shippingData.firstName} ${shippingData.lastName}`,
              email: shippingData.email,
              phone: shippingData.phone,
              address: {
                line1: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.zipCode,
                country: 'US',
              },
            },
          },
        });

        if (error) {
          alert(error.message);
          setIsProcessing(false);
        } else if (paymentIntent.status === 'succeeded') {
          // Create order with payment intent ID
          createOrderMutation.mutate(paymentIntent.id);
        }
      } catch (error: any) {
        alert(error.message || 'Payment failed');
        setIsProcessing(false);
      }
    } else {
      // Handle PayPal or MPesa
      alert(`${paymentMethod} payment integration coming soon!`);
      setIsProcessing(false);
    }
  };

  const steps: { id: Step; label: string; number: number }[] = [
    { id: 'shipping', label: 'Shipping Information', number: 1 },
    { id: 'payment', label: 'Payment Method', number: 2 },
    { id: 'review', label: 'Review Order', number: 3 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Premium Laptop Store</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        index <= currentStepIndex
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {index < currentStepIndex ? '✓' : step.number}
                    </div>
                    <span
                      className={`text-sm mt-2 font-medium ${
                        index <= currentStepIndex
                          ? 'text-primary-600'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 transition-colors ${
                        index < currentStepIndex
                          ? 'bg-primary-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

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
                    <Card className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                      <form onSubmit={handleShippingSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              First Name *
                            </label>
                            <Input
                              required
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
                            <label className="block text-sm font-medium mb-2">
                              Last Name *
                            </label>
                            <Input
                              required
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
                            <label className="block text-sm font-medium mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              required
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
                            <label className="block text-sm font-medium mb-2">
                              Phone *
                            </label>
                            <Input
                              type="tel"
                              required
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
                          <label className="block text-sm font-medium mb-2">
                            Address *
                          </label>
                          <Input
                            required
                            value={shippingData.address}
                            onChange={(e) =>
                              setShippingData((prev) => ({
                                ...prev,
                                address: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              City *
                            </label>
                            <Input
                              required
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
                            <label className="block text-sm font-medium mb-2">
                              State *
                            </label>
                            <Input
                              required
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
                            <label className="block text-sm font-medium mb-2">
                              ZIP Code *
                            </label>
                            <Input
                              required
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

                        {user && (
                          <div className="mb-6">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={saveAddress}
                                onChange={(e) => setSaveAddress(e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">
                                Save this address for future orders
                              </span>
                            </label>
                          </div>
                        )}

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/cart')}
                          >
                            Back to Cart
                          </Button>
                          <Button type="submit" className="flex-1">
                            Continue to Payment
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
                    <Card className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Payment Method</h2>

                      {/* Payment Method Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            paymentMethod === 'card'
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl mb-2">💳</div>
                          <div className="font-medium">Credit/Debit Card</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('paypal')}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            paymentMethod === 'paypal'
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl mb-2">💰</div>
                          <div className="font-medium">PayPal</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mpesa')}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            paymentMethod === 'mpesa'
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="text-2xl mb-2">📱</div>
                          <div className="font-medium">MPesa</div>
                        </button>
                      </div>

                      <form onSubmit={handlePaymentSubmit}>
                        {paymentMethod === 'card' && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                              Card Details
                            </label>
                            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                              <CardElement
                                options={{
                                  style: {
                                    base: {
                                      fontSize: '16px',
                                      color: '#424770',
                                      '::placeholder': {
                                        color: '#aab7c4',
                                      },
                                    },
                                    invalid: {
                                      color: '#9e2146',
                                    },
                                  },
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Your payment is secured by Stripe
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'paypal' && (
                          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <p className="text-sm">
                              You will be redirected to PayPal to complete your payment
                              securely.
                            </p>
                          </div>
                        )}

                        {paymentMethod === 'mpesa' && (
                          <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                              MPesa Phone Number
                            </label>
                            <Input
                              type="tel"
                              placeholder="254712345678"
                              required
                            />
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              You will receive a prompt on your phone to complete the
                              payment
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
                            className="flex-1"
                            disabled={!stripe || isProcessing}
                          >
                            {isProcessing
                              ? 'Processing...'
                              : `Pay ${formatCurrency(total)}`}
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
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span className="text-primary-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Checkout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;
