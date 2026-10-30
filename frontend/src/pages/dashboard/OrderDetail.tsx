import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiMapPin,
  FiCreditCard,
  FiPrinter,
  FiAlertCircle,
  FiClock,
  FiShield,
  FiRotateCcw,
  FiSmartphone,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import orderService from '../../services/orderService';
import warrantyService from '../../services/warrantyService';
import returnService from '../../services/returnService';
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getProductImage,
  DEFAULT_LAPTOP_IMAGE,
} from '../../utils/helpers';

const STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('DEFECTIVE');
  const [returnDescription, setReturnDescription] = useState('');

  // Warranty claim modal state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string | null>(null);
  const [claimDescription, setClaimDescription] = useState('');

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Order cancelled successfully. Stock restored.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
    },
  });

  const returnMutation = useMutation({
    mutationFn: (data: { orderId: string; reason: string; description: string }) =>
      returnService.submitReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setShowReturnModal(false);
      setReturnDescription('');
      toast.success('Return request submitted for inspection review');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit return request');
    },
  });

  const claimMutation = useMutation({
    mutationFn: (data: { warrantyId: string; issueDescription: string }) =>
      warrantyService.submitClaim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      setShowClaimModal(false);
      setClaimDescription('');
      toast.success('Warranty claim submitted to Apexbyte technical team');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to submit warranty claim');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-10 w-48" />
        <LoadingSkeleton className="h-40 w-full" />
        <LoadingSkeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <Card className="text-center py-12">
        <FiAlertCircle className="text-5xl text-red-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The requested order could not be located or you don't have permission to view it.
        </p>
        <Link to="/dashboard/orders">
          <Button>Back to My Orders</Button>
        </Link>
      </Card>
    );
  }

  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';

  // Check 7-day return eligibility window
  const orderDate = new Date(order.updatedAt || order.createdAt);
  const daysSinceUpdate = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
  const isEligibleForReturn = isDelivered && daysSinceUpdate <= 7;

  const mpesaPayment = order.payments?.find((p: any) => p.method === 'MPESA' && p.status === 'PAID');

  const handlePrint = () => {
    window.print();
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnDescription.trim()) {
      toast.error('Please describe the reason for return');
      return;
    }
    returnMutation.mutate({
      orderId: order.id,
      reason: returnReason,
      description: returnDescription,
    });
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarrantyId) return;
    if (!claimDescription.trim()) {
      toast.error('Please describe the hardware issue in detail');
      return;
    }
    claimMutation.mutate({
      warrantyId: selectedWarrantyId,
      issueDescription: claimDescription,
    });
  };

  return (
    <>
      <Helmet>
        <title>Order #{order.orderNumber} - Apexbyte Dashboard</title>
      </Helmet>

      <div className="space-y-6 print:space-y-4">
        {/* Top bar with back button & actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <FiArrowLeft /> Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <FiPrinter /> Print Receipt
            </Button>
            {order.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) {
                    cancelMutation.mutate();
                  }
                }}
                disabled={cancelMutation.isPending}
              >
                Cancel Order
              </Button>
            )}
            {isEligibleForReturn && (
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center gap-1.5"
                onClick={() => setShowReturnModal(true)}
              >
                <FiRotateCcw /> Request Return / Refund
              </Button>
            )}
          </div>
        </div>

        {/* Order Header Card */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </h1>
                <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Placed on {formatDate(order.createdAt)} • Payment Method: <strong>{order.paymentMethod}</strong>
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-[11px] sm:text-xs uppercase font-bold text-gray-500 dark:text-gray-400 block">
                Total Amount
              </span>
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-primary-600 dark:text-primary-400">
                {formatCurrency(Number(order.total) || 0)}
              </span>
            </div>
          </div>

          {/* Progress Tracker (unless cancelled) */}
          {!isCancelled ? (
            <div className="pt-4 sm:pt-6 overflow-x-auto">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-3 sm:mb-4">
                Fulfillment Progress
              </span>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 min-w-[320px]">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1 sm:mb-1.5 ${
                          isDone
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/40' : ''}`}
                      >
                        {isDone ? <FiCheckCircle /> : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] sm:text-xs font-bold uppercase tracking-wider ${
                          isDone
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-4 text-center py-4 bg-red-50 dark:bg-red-950/20 rounded-xl mt-4 border border-red-200 dark:border-red-900/30">
              <p className="text-red-700 dark:text-red-400 font-bold text-sm">
                This order was cancelled and inventory was returned to stock.
              </p>
            </div>
          )}
        </Card>

        {/* Two Columns: Items & Address/Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Items Table (2 cols) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <FiPackage className="text-primary-600" /> Purchased Hardware ({order.items?.length || 0})
              </h2>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-3 sm:py-4 space-y-2.5 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                          <img
                            src={item.productImage || getProductImage(item.product)}
                            alt={item.productName}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/products/${item.productId}`}
                            className="font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1 text-xs sm:text-base"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                            SKU: {item.productSku || 'APEX-LAPTOP'} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0 pl-15 sm:pl-0 flex items-center justify-between sm:block">
                        <span className="font-bold text-gray-900 dark:text-white block text-sm sm:text-base">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </span>
                        <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(Number(item.price))} each
                        </span>
                      </div>
                    </div>

                    {/* Warranty badge & claim trigger */}
                    {item.warranty && (
                      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FiShield className="text-emerald-600 text-sm" />
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-300">
                              1-Year Warranty ({item.warranty.status})
                            </span>
                            {item.warranty.serialNumber && (
                              <span className="ml-2 font-mono text-gray-600 dark:text-gray-400">
                                S/N: {item.warranty.serialNumber}
                              </span>
                            )}
                            <p className="text-gray-500 dark:text-gray-400">
                              Valid until: {formatDate(item.warranty.endDate)}
                            </p>
                          </div>
                        </div>

                        {item.warranty.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-700 border-emerald-300 hover:bg-emerald-100 text-xs py-1 px-2.5"
                            onClick={() => {
                              setSelectedWarrantyId(item.warranty.id);
                              setShowClaimModal(true);
                            }}
                          >
                            File Claim
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal) || 0)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount Applied</span>
                    <span>-{formatCurrency(Number(order.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (8% VAT)</span>
                  <span>{formatCurrency(Number(order.tax) || 0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Courier / Dispatch Fee</span>
                  <span>
                    {Number(order.shippingCost) === 0 ? 'FREE' : formatCurrency(Number(order.shippingCost))}
                  </span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-black text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Paid / Payable</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(Number(order.total) || 0)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Status History Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <Card className="p-6">
                <h3 className="text-base font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <FiClock className="text-primary-600" /> Order Lifecycle Audit Timeline
                </h3>
                <div className="space-y-4">
                  {order.statusHistory.map((hist: any, index: number) => (
                    <div key={hist.id || index} className="flex items-start gap-3 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />
                      <div className="flex-1 pb-2 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {hist.newStatus}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(hist.createdAt)}
                          </span>
                        </div>
                        {hist.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            {hist.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Existing Return Requests */}
            {order.returnRequests && order.returnRequests.length > 0 && (
              <Card className="p-6">
                <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                  <FiRotateCcw className="text-amber-500" /> Return & Refund Requests
                </h3>
                <div className="space-y-3">
                  {order.returnRequests.map((ret: any) => (
                    <div key={ret.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                          #{ret.returnNumber}
                        </span>
                        <Badge variant={ret.status === 'REFUNDED' ? 'success' : 'warning'}>
                          {ret.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        <strong>Reason:</strong> {ret.reason} • {ret.description}
                      </p>
                      {ret.refundAmount && (
                        <p className="text-xs font-bold text-emerald-600 mt-1">
                          Refund Credited: {formatCurrency(Number(ret.refundAmount))}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Delivery & Payment Info (1 col) */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-amber-500" /> Delivery Address
              </h3>
              {order.shippingAddress ? (
                <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Mocha Place Showroom Pickup or Courier Details on file
                </p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-emerald-500" /> Payment Summary
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method:</span>
                  <span className="font-bold">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Status:</span>
                  <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                    {order.paymentStatus}
                  </Badge>
                </div>

                {mpesaPayment && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1 text-xs">
                    <p className="flex items-center gap-1 font-bold text-emerald-600">
                      <FiSmartphone /> M-Pesa Verified
                    </p>
                    {mpesaPayment.mpesaReceiptNumber && (
                      <p className="font-mono text-gray-800 dark:text-gray-200">
                        Receipt: {mpesaPayment.mpesaReceiptNumber}
                      </p>
                    )}
                    {mpesaPayment.phoneNumber && (
                      <p className="text-gray-500">Handset: {mpesaPayment.phoneNumber}</p>
                    )}
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-gray-500">Tracking #:</span>
                    <span className="font-mono font-bold text-primary-600">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Request Return & Refund
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Apexbyte offers a 7-day hassle-free return window for verified hardware defects or discrepancies.
            </p>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="DEFECTIVE">Hardware Defect / Malfunction</option>
                  <option value="NOT_AS_DESCRIBED">Specs Do Not Match Description</option>
                  <option value="DAMAGED_IN_TRANSIT">Courier Transit Damage</option>
                  <option value="WRONG_ITEM">Wrong Laptop Model Received</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Detailed Explanation *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue in detail (at least 10 characters)..."
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  disabled={returnMutation.isPending}
                >
                  {returnMutation.isPending ? 'Submitting...' : 'Submit Return'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warranty Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              File Warranty Claim
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Submit your hardware issue to our bench technicians at Mocha Place showroom.
            </p>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Hardware Issue Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Battery not charging, display flickering, keyboard key unseated..."
                  value={claimDescription}
                  onChange={(e) => setClaimDescription(e.target.value)}
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowClaimModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  disabled={claimMutation.isPending}
                >
                  {claimMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetail;
