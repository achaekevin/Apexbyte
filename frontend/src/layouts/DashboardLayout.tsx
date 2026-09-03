import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMapPin,
} from 'react-icons/fi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/dashboard/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: FiHeart },
  { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { path: '/dashboard/addresses', label: 'Addresses', icon: FiMapPin },
];

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:col-span-1"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
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
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-3"
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
