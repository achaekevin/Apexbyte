import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
} from 'react-icons/fi';
import Header from '../components/layout/Header';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome },
  { path: '/admin/products', label: 'Products', icon: FiPackage },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/customers', label: 'Customers', icon: FiUsers },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold gradient-text mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Content */}
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
