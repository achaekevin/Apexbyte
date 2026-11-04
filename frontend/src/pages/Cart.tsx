import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { FiShoppingCart, FiTruck, FiShield, FiRotateCcw, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import couponService from '../services/couponService';
import { useSettings } from '../hooks/useSettings';
import TechBackground from '../components/ui/TechBackground';

const Cart = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Dynamic pricing settings
  const freeShippingThreshold = Number(settings.free_shipping_threshold) || 50000;
  const standardShippingFee = Number(settings.shipping_fee) || 1500;
  const taxRatePercent = Number(settings.tax_rate_percent) || 0;
  const taxRate = taxRatePercent / 100;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + shippingCost + tax;

  // Apply coupon mutation
  const applyCouponMutation = useMutation({
    mutationFn: (code: string) =>
      couponService.validateCoupon({ code, subtotal }),
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setCouponError('');
    },
    onError: (error: any) => {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    },
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    applyCouponMutation.mutate(couponCode.toUpperCase());
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    if (newQuantity < 1) {
      removeItem(productId);
    } else if (!item.stock || newQuantity <= item.stock) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      setAppliedCoupon(null);
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Premium Laptop Store</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <FiShoppingCart size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/shop">
                <Button size="lg">Start Shopping</Button>
              </Link>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${items.length} items) - Apexbyte Laptops`}</title>
      </Helmet>

      <TechBackground variant="minimal" className="min-h-screen bg-gray-50/90 dark:bg-gray-900/90 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight">Shopping Cart</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Button variant="ghost" onClick={handleClearCart}>
              Clear Cart
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <Link
                          to={`/products/${item.productId}`}
                          className="flex-shrink-0"
                        >
                          <img
                            src={getProductImage(item.image)}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                            }}
                            className="w-18 h-18 sm:w-24 sm:h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="font-bold text-sm sm:text-base mb-1 hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-base sm:text-lg font-black text-primary-600 dark:text-primary-400 mb-2 tracking-tight">
                            {formatCurrency(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-sm"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className="w-12 sm:w-16 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent py-1 font-bold text-sm"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="px-2.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-sm"
                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                              {item.stock !== undefined ? `${item.stock} left` : 'In stock'}
                            </span>
                          </div>

                          {/* Stock Warning */}
                          {item.stock !== undefined && item.quantity > item.stock && (
                            <p className="text-xs sm:text-sm font-semibold text-red-600 mt-1.5">
                              Only {item.stock} available in stock
                            </p>
                          )}
                        </div>

                        {/* Item Total & Remove */}
                        <div className="flex flex-col items-end justify-between shrink-0">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Remove item"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Subtotal
                            </p>
                            <p className="text-xl font-bold">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <Link to="/shop">
                <Button variant="outline" fullWidth>
                  ← Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-4">
                <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-medium mb-2">
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <Badge variant="success" className="mb-1">
                          Applied
                        </Badge>
                        <p className="text-sm font-medium">{appliedCoupon.code}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {appliedCoupon.description}
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter code"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleApplyCoupon}
                          disabled={applyCouponMutation.isPending}
                        >
                          {applyCouponMutation.isPending ? 'Checking...' : 'Apply'}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-600 mt-2">{couponError}</p>
                      )}
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Try: WELCOME10, SAVE50
                      </p>
                    </>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3.5 mb-6">
                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Subtotal
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-base text-green-600 dark:text-green-400 font-semibold">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-bold">
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Shipping
                    </span>
                    <span className="font-bold">
                      {shippingCost === 0 ? (
                        <Badge variant="success">FREE</Badge>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>

                  {subtotal < freeShippingThreshold && shippingCost > 0 && (
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Add {formatCurrency(freeShippingThreshold - subtotal)} more for free shipping!
                    </p>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Tax ({taxRatePercent}%)
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  className="mb-4"
                >
                  Proceed to Checkout
                </Button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Secure Checkout</span>
                </div>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                    We accept
                  </p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Badge variant="info">Visa</Badge>
                    <Badge variant="info">Mastercard</Badge>
                    <Badge variant="info">PayPal</Badge>
                    <Badge variant="info">MPesa</Badge>
                  </div>
                </div>
              </Card>

              {/* Free Shipping Banner */}
              {subtotal < freeShippingThreshold && (
                <div className="mt-4">
                  <Card className="p-4 bg-blue-50/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-center gap-3">
                      <FiTruck className="text-primary-600 dark:text-primary-400 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-medium text-sm">
                          Free Shipping on orders over {formatCurrency(freeShippingThreshold)}!
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          You're only {formatCurrency(freeShippingThreshold - subtotal)} away
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FiShield,
                title: 'Secure Payment',
                desc: 'Your payment information is encrypted',
              },
              {
                icon: FiRotateCcw,
                title: '30-Day Returns',
                desc: 'Easy returns within 30 days',
              },
              {
                icon: FiCheckCircle,
                title: 'Warranty Included',
                desc: 'All products come with manufacturer warranty',
              },
            ].map((feature) => {
              const IconComp = feature.icon;
              return (
                <Card key={feature.title} className="p-5 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <IconComp size={22} />
                  </div>
                  <h3 className="font-bold text-base mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </TechBackground>
    </>
  );
};

export default Cart;
