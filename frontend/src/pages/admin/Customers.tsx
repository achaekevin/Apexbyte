import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiPhone, FiMail, FiShoppingBag } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import userService, { CustomerUser } from '../../services/userService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-customers', { page: currentPage, search: searchQuery, role: roleFilter }],
    queryFn: () =>
      userService.getCustomers({
        page: currentPage,
        limit: 15,
        search: searchQuery || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      }),
  });

  const customers = response?.data || [];
  const pagination = response?.pagination || { page: 1, totalPages: 1, total: customers.length };

  return (
    <>
      <Helmet>
        <title>Manage Customers - Apexbyte Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View registered clients, buyer order history, lifetime spend, and account roles.
          </p>
        </div>

        {/* Filter & Search */}
        <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search customers by name, email, phone..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 shrink-0">
              Role:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-primary-500"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>
        </Card>

        {/* Customers Table */}
        <Card className="overflow-hidden border border-gray-200 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4">
                        <LoadingSkeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c: CustomerUser) => (
                    <tr
                      key={c.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold shrink-0 border border-primary-500/20">
                            {c.avatar ? (
                              <img
                                src={c.avatar}
                                alt={c.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}` || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {c.fullName || `${c.firstName} ${c.lastName}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {c.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                          <FiMail className="text-gray-400" /> {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1">
                            <FiPhone className="text-emerald-500" /> {c.phone}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            c.role === 'SUPER_ADMIN'
                              ? 'error'
                              : c.role === 'ADMIN'
                              ? 'warning'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {c.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                        <span className="flex items-center gap-1">
                          <FiShoppingBag className="text-primary-500" /> {c.totalOrders}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(c.totalSpent || 0)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(c.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total customers)
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

export default AdminCustomers;
