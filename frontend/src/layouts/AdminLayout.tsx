import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiPackage,
  FiTag,
  FiShoppingBag,
  FiUsers,
  FiShield,
  FiSettings,
  FiExternalLink,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import Header from '../components/layout/Header';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import TechBackground from '../components/ui/TechBackground';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: FiHome },
  { path: '/admin/products', label: 'Laptops', icon: FiPackage },
  { path: '/admin/brands', label: 'Brands', icon: FiTag },
  { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { path: '/admin/customers', label: 'Customers', icon: FiUsers },
  { path: '/admin/team', label: 'Admin Team', icon: FiShield },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const AdminLayout = () => {
  const location = useLocation();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Mobile Admin Navigation Bar (under 1024px) */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2.5 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            aria-label="Toggle admin menu"
          >
            {mobileDrawerOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Admin Panel
          </span>
        </div>

        {/* Quick Horizontal Tab Bar for common admin tasks */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-[220px] sm:max-w-none">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-grow flex relative">
        {/* Desktop Sidebar (lg:flex) */}
        <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col justify-between shrink-0">
          <div className="p-6">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Store Admin
            </h2>
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 transition-colors"
            >
              <FiExternalLink size={14} />
              <span>View Live Store</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Slide-Out Drawer Overlay */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-4">
                    <h2 className="font-black text-lg text-gray-900 dark:text-white">Admin Menu</h2>
                    <button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  <nav className="space-y-1.5">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isActive
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    to="/"
                    target="_blank"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary-600"
                  >
                    <FiExternalLink size={14} />
                    <span>View Live Store</span>
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <TechBackground variant="dashboard" className="flex-grow min-w-0">
          <main className="p-3.5 sm:p-6 lg:p-8 overflow-x-hidden min-w-0">
            <ErrorBoundary
              key={location.pathname}
              resetKeys={[location.pathname]}
              variant="section"
              title="Admin View Encountered an Error"
            >
              <Outlet />
            </ErrorBoundary>
          </main>
        </TechBackground>
      </div>
    </div>
  );
};

export default AdminLayout;
