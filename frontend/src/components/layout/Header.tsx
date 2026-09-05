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
  FiMonitor,
  FiLogOut,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';
import { useComparisonStore } from '../../store/comparisonStore';
import Button from '../ui/Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const { themeMode, setThemeMode } = useThemeStore();
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
    { path: '/compare', label: 'Compare Specs' },
    { path: '/blog', label: 'Tech Guides' },
    { path: '/about', label: 'About Apexbyte' },
    { path: '/contact', label: 'Showroom & Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors">
      {/* Top Authentic Store Notice Bar */}
      <div className="bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-300 text-[11px] sm:text-xs py-1.5 px-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kisii CBD Showroom Open Today
            </span>
            <span className="hidden md:inline text-gray-400 dark:text-slate-600">•</span>
            <span className="hidden md:inline text-gray-600 dark:text-slate-300">
              Mocha Place, 2nd Floor, Hospital Road, Kisii Town
            </span>
            <span className="hidden lg:inline text-gray-400 dark:text-slate-600">•</span>
            <span className="hidden lg:inline text-amber-700 dark:text-amber-400 font-medium">
              🚚 Same-Day Delivery across Kisii, Nyamira & South Nyanza
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-gray-600 dark:text-slate-300">
            <a
              href="tel:+254104504692"
              className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-white transition-colors font-medium"
            >
              <FiPhone className="text-emerald-500" />
              <span>+254 104 504 692</span>
            </a>
            <span className="hidden sm:inline text-gray-300 dark:text-slate-700">|</span>
            <Link
              to="/contact"
              className="hidden sm:flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
            >
              <FiMapPin className="text-amber-500" />
              <span>Directions</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Authentic Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M12 7l3 5h-6z" fill="#f59e0b" stroke="none" />
              </svg>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
                Apex<span className="text-primary-600 dark:text-primary-400">byte</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 mt-0.5">
                Laptops Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative flex items-center gap-1.5 text-sm"
              >
                <span>{link.label}</span>
                {link.path === '/compare' && comparisonProducts.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {comparisonProducts.length}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <button
              onClick={() => navigate('/shop')}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Search laptops"
            >
              <FiSearch size={20} />
            </button>

            {/* 3-State Theme Mode Switcher (Light / Dark / System) */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
              <button
                onClick={() => setThemeMode('light')}
                title="Light Mode"
                aria-label="Light mode"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiSun size={15} />
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                title="Dark Mode"
                aria-label="Dark mode"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-gray-700 text-sky-400 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiMoon size={15} />
              </button>
              <button
                onClick={() => setThemeMode('system')}
                title="System Mode (Auto adapt)"
                aria-label="System mode"
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-gray-700 text-primary-500 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiMonitor size={15} />
              </button>
            </div>

            {/* Wishlist */}
            <Link
              to="/dashboard/wishlist"
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Wishlist"
            >
              <FiHeart size={20} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
              aria-label="Shopping Cart"
            >
              <FiShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-xs font-bold flex items-center justify-center shadow-sm">
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
                    className="flex items-center space-x-2 p-1 rounded-full hover:ring-2 hover:ring-primary-500 transition-all"
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
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/dashboard/orders"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          My Orders
                        </Link>
                        {user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' ? (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-amber-600 dark:text-amber-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Store Management
                          </Link>
                        ) : null}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
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
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.path === '/compare' && comparisonProducts.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {comparisonProducts.length}
                    </span>
                  )}
                </Link>
              ))}
              {/* Mobile Theme Selector */}
              <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-800">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 block mb-2">
                  Theme Appearance
                </span>
                <div className="grid grid-cols-3 gap-2 px-2">
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'light'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiSun size={14} /> Light
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'dark'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiMoon size={14} /> Dark
                  </button>
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      themeMode === 'system'
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FiMonitor size={14} /> Auto
                  </button>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 text-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold"
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
