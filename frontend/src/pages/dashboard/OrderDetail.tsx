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
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import orderService from '../../services/orderService';
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

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderService.cancelOrder(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Order cancelled successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to cancel order');
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

  const handlePrint = () => {
    window.print();
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
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    cancelMutation.mutate();
                  }
                }}
                disabled={cancelMutation.isPending}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Order Header Card */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </h1>
                <Badge variant={getOrderStatusColor(order.status)}>{order.status}</Badge>
                <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Placed on {formatDate(order.createdAt)} • Payment Method: <strong>{order.paymentMethod}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 block">
                Total Amount
              </span>
              <span className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400">
                {formatCurrency(Number(order.total) || 0)}
              </span>
            </div>
          </div>

          {/* Progress Tracker (unless cancelled) */}
          {!isCancelled ? (
            <div className="pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-4">
                Fulfillment Progress
              </span>
              <div className="grid grid-cols-5 gap-2 relative">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all mb-1.5 ${
                          isDone
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100 dark:ring-primary-900/40' : ''}`}
                      >
                        {isDone ? <FiCheckCircle /> : idx + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
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
                This order was cancelled and is no longer being processed.
              </p>
            </div>
          )}
        </Card>

        {/* Two Columns: Items & Address/Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items Table (2 cols) */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiPackage className="text-primary-600" /> Purchased Hardware ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-700">
                      <img
                        src={item.productImage || getProductImage(item.product)}
                        alt={item.productName}
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-bold text-gray-900 dark:text-white hover:text-primary-600 transition-colors line-clamp-1 text-sm sm:text-base"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SKU: {item.productSku || 'APEX-LAPTOP'} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-gray-900 dark:text-white block text-sm sm:text-base">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(Number(item.price))} each
                    </span>
                  </div>
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
    </>
  );
};

export default OrderDetail;
