import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import orderService from '../../services/orderService';
import { formatCurrency, getOrderStatusColor, getProductImage, DEFAULT_LAPTOP_IMAGE } from '../../utils/helpers';

const Orders = () => {
  const [filter, setFilter] = useState<string>('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', filter],
    queryFn: () =>
      orderService.getOrders({
        status: filter === 'all' ? undefined : filter,
      }),
  });

  const filterOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <>
      <Helmet>
        <title>My Orders - Premium Laptop Store</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'primary' : 'outline'}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-32" />
            ))}
          </div>
        ) : ordersData?.data.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">No orders found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet"
                : `No ${filter.toLowerCase()} orders`}
            </p>
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {ordersData?.data.map((order: any, index: number) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{order.orderNumber}</h3>
                        <Badge variant={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600 mb-2">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <Link to={`/dashboard/orders/${order.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item: any) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={getProductImage(item.productImage || item.product)}
                          alt={item.product?.name || item.productName}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_LAPTOP_IMAGE;
                          }}
                          className="w-16 h-16 object-cover rounded bg-gray-100 dark:bg-gray-800"
                        />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">
                            {item.product?.name || item.productName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        + {order.items.length - 2} more item
                        {order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Orders;
