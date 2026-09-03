import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { useAuthStore } from '../../store/authStore';
import orderService from '../../services/orderService';
import { formatCurrency, getOrderStatusColor } from '../../utils/helpers';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Fetch recent orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => orderService.getOrders({ page: 1, limit: 5 }),
  });

  const stats = [
    {
      label: 'Total Orders',
      value: ordersData?.pagination.total || 0,
      icon: '📦',
      color: 'bg-blue-500',
    },
    {
      label: 'Pending Orders',
      value:
        ordersData?.data.filter((o: any) => o.status === 'PENDING').length || 0,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed',
      value:
        ordersData?.data.filter((o: any) => o.status === 'DELIVERED').length ||
        0,
      icon: '✓',
      color: 'bg-green-500',
    },
    {
      label: 'Total Spent',
      value: formatCurrency(
        ordersData?.data.reduce((sum: number, o: any) => sum + o.totalAmount, 0) ||
          0
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your account
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/shop">
            <Card className="p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-4xl mb-3">🛍️</div>
              <h3 className="font-bold mb-2">Browse Products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore our latest laptops and deals
              </p>
            </Card>
          </Link>
          <Link to="/dashboard/orders">
            <Card className="p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-bold mb-2">Track Orders</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage your orders
              </p>
            </Card>
          </Link>
          <Link to="/dashboard/wishlist">
            <Card className="p-6 hover:shadow-premium transition-all cursor-pointer">
              <div className="text-4xl mb-3">❤️</div>
              <h3 className="font-bold mb-2">Wishlist</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your saved items
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Orders</h2>
            <Link to="/dashboard/orders">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingSkeleton key={i} className="h-20" />
              ))}
            </div>
          ) : ordersData?.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No orders yet
              </p>
              <Link to="/shop">
                <Button>Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData?.data.slice(0, 5).map((order: any) => (
                <Link
                  key={order.id}
                  to={`/dashboard/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold">{order.orderNumber}</span>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()} •{' '}
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">
                        {formatCurrency(order.totalAmount)}
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
