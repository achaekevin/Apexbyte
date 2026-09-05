import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { formatCurrency, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../utils/helpers';
import { useCartStore } from '../store/cartStore';
import couponService from '../services/couponService';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = subtotal > 50000 ? 0 : 1500;
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-8xl mb-6"
              >
                🛒
              </motion.div>
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

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
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
                    <Card className="p-4">
                      <div className="flex gap-4">
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
                            className="w-24 h-24 object-cover rounded-lg bg-gray-100 dark:bg-gray-800"
                          />
                        </Link>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link to={`/products/${item.productId}`}>
                            <h3 className="font-bold text-base sm:text-lg mb-1.5 hover:text-primary-600 transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-xl sm:text-2xl font-black text-primary-600 dark:text-primary-400 mb-2 tracking-tight">
                            {formatCurrency(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold"
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
                                className="w-16 text-center border-x border-gray-300 dark:border-gray-600 bg-transparent py-1 font-bold"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold"
                                disabled={item.stock !== undefined && item.quantity >= item.stock}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-400">
                              {item.stock !== undefined ? `${item.stock} available` : 'In stock'}
                            </span>
                          </div>

                          {/* Stock Warning */}
                          {item.stock !== undefined && item.quantity > item.stock && (
                            <p className="text-sm sm:text-base font-semibold text-red-600 mt-2">
                              Only {item.stock} available in stock
                            </p>
                          )}
                        </div>

                        {/* Item Total & Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
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

                  {subtotal < 50000 && shippingCost > 0 && (
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      Add {formatCurrency(50000 - subtotal)} more for free shipping!
                    </p>
                  )}

                  <div className="flex justify-between text-base">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Tax (8%)
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
              {subtotal < 50000 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Card className="p-4 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border-primary-200 dark:border-primary-800">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">🚚</div>
                      <div>
                        <p className="font-medium text-sm">
                          Free Shipping on orders over KSh 50,000!
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          You're only {formatCurrency(50000 - subtotal)} away
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Secure Payment',
                desc: 'Your payment information is encrypted',
              },
              {
                icon: '↩️',
                title: '30-Day Returns',
                desc: 'Easy returns within 30 days',
              },
              {
                icon: '✓',
                title: 'Warranty Included',
                desc: 'All products come with manufacturer warranty',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 text-center">
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
