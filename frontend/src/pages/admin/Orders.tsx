import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiSearch, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const STATUS_TABS = [
  { label: 'All Orders', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Shipped', value: 'SHIPPED' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-orders', { page: currentPage, status: selectedStatus, search: searchQuery }],
    queryFn: () =>
      orderService.getAllOrdersAdmin({
        page: currentPage,
        limit: 15,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      }),
  });

  const orders = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: orders.length };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated successfully');
      setUpdatingOrderId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update order status');
      setUpdatingOrderId(null);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  return (
    <>
      <Helmet>
        <title>Manage Orders - Apexbyte Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track dispatch workflows, verify customer payment methods, and update courier fulfillment states.
          </p>
        </div>

        {/* Filter Bar & Search */}
        <Card className="p-4 space-y-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  selectedStatus === tab.value
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by Order #, customer name, or email..."
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="p-4">
                        <LoadingSkeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord: any) => {
                    const customerName = ord.user
                      ? `${ord.user.firstName} ${ord.user.lastName}`
                      : ord.guestFirstName
                      ? `${ord.guestFirstName} ${ord.guestLastName}`
                      : 'Guest Customer';
                    const customerEmail = ord.user?.email || ord.guestEmail || '';

                    return (
                      <tr
                        key={ord.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                          {ord.orderNumber}
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {customerName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
                            {customerEmail}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {formatDate(ord.createdAt)}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">
                          {ord.items?.length || ord._count?.items || 1}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(Number(ord.total) || 0)}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <Badge
                              variant={ord.paymentStatus === 'PAID' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {ord.paymentStatus}
                            </Badge>
                            <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                              {ord.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <select
                            value={ord.status}
                            disabled={updatingOrderId === ord.id}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className="text-xs font-bold uppercase tracking-wider rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 px-2.5 focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="REFUNDED">Refunded</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <Link to={`/dashboard/orders/${ord.id}`}>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <FiEye /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default AdminOrders;
