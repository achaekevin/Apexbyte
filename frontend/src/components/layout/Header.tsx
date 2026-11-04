import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart,
  FiHeart,
  FiMenu,
  FiX,
  FiSearch,
  FiSun,
  FiMoon,
  FiLogOut,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { useComparisonStore } from '../../store/comparisonStore';
import Button from '../ui/Button';
import useSettings from '../../hooks/useSettings';

const Header = () => {
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { products: comparisonProducts } = useComparisonStore();
  const navigate = useNavigate();

  // Close user dropdown when clicking outside on the main page
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close menus on page navigation
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const cartItemsCount = getTotalItems();

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop Laptops' },
    { path: '/finder', label: 'Laptop Finder' },
    { path: '/compare', label: 'Compare Specs' },
    { path: '/blog', label: 'Tech Guides' },
    { path: '/about', label: 'About Apexbyte' },
    { path: '/contact', label: 'Showroom & Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors shadow-xs">
      {/* Top Store Notice Bar (Dynamically controlled from Admin Settings) */}
      {settings.announcement_enabled && (
        <div className="bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-200 text-xs sm:text-sm py-2 px-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              {settings.announcement_badge && (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {settings.announcement_badge}
                </span>
              )}
              {settings.announcement_badge && settings.showroom_address && (
                <span className="hidden md:inline text-gray-400 dark:text-slate-600">•</span>
              )}
              {settings.showroom_address && (
                <span className="hidden md:inline text-gray-700 dark:text-slate-200 font-medium">
                  {settings.showroom_address}
                </span>
              )}
              <span className="hidden lg:inline text-gray-400 dark:text-slate-600">•</span>
              <Link
                to={settings.announcement_link || '/contact'}
                className="hover:underline text-amber-700 dark:text-amber-400 font-semibold truncate"
              >
                {settings.announcement_text}
              </Link>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-gray-700 dark:text-slate-200">
              <a
                href={`tel:${settings.phone_primary.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-white transition-colors font-bold"
              >
                <FiPhone className="text-emerald-500" />
                <span>{settings.phone_primary}</span>
              </a>
              <span className="hidden sm:inline text-gray-300 dark:text-slate-700">|</span>
              <Link
                to="/contact"
                className="hidden sm:flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-bold"
              >
                <FiMapPin className="text-amber-500" />
                <span>Directions</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Authentic Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M12 7l3 5h-6z" fill="#f59e0b" stroke="none" />
              </svg>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                Apex<span className="text-primary-600 dark:text-primary-400">byte</span>
              </span>
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">
                Laptops Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-semibold transition-colors relative flex items-center gap-1.5 text-sm lg:text-base"
              >
                <span>{link.label}</span>
                {link.path === '/compare' && comparisonProducts.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                    {comparisonProducts.length}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search */}
            <button
              onClick={() => navigate('/shop')}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Search laptops"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Single Theme Toggle Button (Light / Dark) */}
            <motion.button
              onClick={toggleTheme}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
              title={isDarkMode ? 'Dark Mode Active • Tap for Light Mode' : 'Light Mode Active • Tap for Dark Mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDarkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-amber-400"
                  >
                    <FiSun size={19} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-700 hover:text-primary-600"
                  >
                    <FiMoon size={19} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Wishlist */}
            <Link
              to="/dashboard/wishlist"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 sm:top-1 sm:right-1 w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center shadow-sm">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:ring-2 hover:ring-primary-500 transition-all"
                    aria-label="User profile menu"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                      >
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>

                        <Link
                          to="/dashboard"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/dashboard/orders"
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          My Orders
                        </Link>
                        {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
                          <Link
                            to="/admin"
                            className="block px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Store Management
                          </Link>
                        ) : null}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <FiLogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <nav className="px-3 sm:px-4 py-4 space-y-1 sm:space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between px-3.5 py-3 min-h-[44px] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm sm:text-base font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.path === '/compare' && comparisonProducts.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                      {comparisonProducts.length}
                    </span>
                  )}
                </Link>
              ))}
              {/* Mobile Theme Selector */}
              <div className="pt-2.5 pb-1 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3.5 py-3 min-h-[44px] rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="flex items-center gap-2.5 text-sm font-semibold">
                    {isDarkMode ? (
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <FiSun className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-600 flex items-center justify-center">
                        <FiMoon className="w-4 h-4" />
                      </span>
                    )}
                    <span>Theme: {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-600 text-white font-bold">
                    Switch to {isDarkMode ? 'Light' : 'Dark'}
                  </span>
                </button>
              </div>

              {!isAuthenticated && (
                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 min-h-[44px] flex items-center justify-center text-center px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 min-h-[44px] flex items-center justify-center text-center px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
