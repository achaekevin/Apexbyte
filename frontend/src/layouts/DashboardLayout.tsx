import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiShoppingBag,
  FiHeart,
  FiUser,
  FiMapPin,
} from 'react-icons/fi';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/ui/ErrorBoundary';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/dashboard/orders', label: 'My Orders', icon: FiShoppingBag },
  { path: '/dashboard/wishlist', label: 'Wishlist', icon: FiHeart },
  { path: '/dashboard/profile', label: 'Profile', icon: FiUser },
  { path: '/dashboard/addresses', label: 'Addresses', icon: FiMapPin },
];

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          {/* Mobile Horizontal Tab Navigation (under md) */}
          <div className="md:hidden mb-4 overflow-x-auto scrollbar-none pb-1">
            <div className="flex items-center gap-2 min-w-max">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Desktop Sidebar (md:block) */}
            <aside className="hidden md:block md:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sticky top-24">
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
                            ? 'bg-primary-600 text-white shadow-sm'
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
            </aside>

            {/* Content Area */}
            <main className="md:col-span-3 min-w-0">
              <ErrorBoundary variant="section" title="Dashboard Content Unavailable">
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
