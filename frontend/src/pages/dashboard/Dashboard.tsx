import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import orderService from '../../services/orderService';
import { formatCurrency, getOrderStatusColor } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Fetch recent orders
  const {
    data: ordersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderService.getOrders({ page: 1, limit: 5 }),
  });

  const ordersList: any[] = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const totalOrders = ordersData?.pagination?.total || ordersList.length;

  const stats = [
    {
      label: 'Total Orders',
      value: isLoading ? '...' : totalOrders,
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Orders',
      value: isLoading
        ? '...'
        : ordersList.filter((o: any) => o.status === 'PENDING').length,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed',
      value: isLoading
        ? '...'
        : ordersList.filter((o: any) => o.status === 'DELIVERED').length,
      icon: '✓',
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: isLoading
        ? '...'
        : formatCurrency(
            ordersList.reduce(
              (sum: number, o: any) => sum + (Number(o.total || o.totalAmount) || 0),
              0
            )
          ),
      icon: '💰',
      color: 'bg-purple-500',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Premium Laptop Store</title>
      </Helmet>

      <div>
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-3 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div
                    className={`w-9 h-9 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center text-lg sm:text-2xl shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-base sm:text-2xl font-bold truncate">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Link to="/shop">
            <Card className="p-4 sm:p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">🛍️</div>
              <h3 className="font-bold text-sm sm:text-base mb-1">Browse Products</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Explore our latest laptops and deals
              </p>
            </Card>
          </Link>
          <Link to="/dashboard/orders">
            <Card className="p-4 sm:p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">📦</div>
              <h3 className="font-bold text-sm sm:text-base mb-1">Track Orders</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                View and manage your orders
              </p>
            </Card>
          </Link>
          <Link to="/dashboard/wishlist">
            <Card className="p-4 sm:p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-2xl sm:text-4xl mb-2 sm:mb-3">❤️</div>
              <h3 className="font-bold text-sm sm:text-base mb-1">Wishlist</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage your saved items
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold">Recent Orders</h2>
            <Link to="/dashboard/orders">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} className="h-20" />
              ))}
            </div>
          ) : isError ? (
            <ErrorMessage
              variant="card"
              title="Unable to load recent orders"
              message="We couldn't retrieve your recent orders right now. Please check your connection or retry."
              error={error}
              onRetry={() => refetch()}
            />
          ) : ordersList.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              description="You haven't placed any orders yet. Discover our curated collection of high-performance laptops."
              actionLabel="Start Shopping"
              actionHref="/shop"
            />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {ordersList.slice(0, 5).map((order: any) => (
                <Link
                  key={order.id}
                  to={`/dashboard/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-500 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs sm:text-sm">{order.orderNumber}</span>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} •{' '}
                        {Array.isArray(order.items) ? order.items.length : 0} item
                        {Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-base sm:text-lg font-bold text-primary-600">
                        {formatCurrency(order.totalAmount || order.total || 0)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
