import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch,
  FiHome,
  FiArrowLeft,
  FiShoppingBag,
  FiCompass,
  FiPhone,
} from 'react-icons/fi';
import Button from '../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/shop');
    }
  };

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Apexbyte Laptops Kenya</title>
        <meta
          name="description"
          content="The page you are looking for could not be found. Explore verified business, gaming, and developer laptops at Apexbyte Kenya."
        />
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12 sm:py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Branded 404 Accent Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>HTTP 404 • Resource Missing</span>
          </div>

          <h1 className="text-7xl sm:text-9xl font-black text-primary-600 tracking-tight leading-none mb-4 select-none">
            404
          </h1>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Laptop or Page Not Found
          </h2>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-8 leading-relaxed">
            The link you clicked might be outdated, the product may have been purchased or relocated, or the address was mistyped.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search Core i5, MacBook Pro, HP, Dell..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-24 py-3 min-h-[46px] rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none shadow-sm"
              />
              <FiSearch className="absolute left-3.5 text-gray-400 w-5 h-5" />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button
              onClick={() => navigate(-1)}
              leftIcon={<FiArrowLeft />}
              variant="outline"
              className="text-xs sm:text-sm font-semibold border-gray-300 dark:border-gray-600"
            >
              Go Back
            </Button>
            <Link to="/">
              <Button
                leftIcon={<FiHome />}
                className="bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md"
              >
                Return to Homepage
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                leftIcon={<FiShoppingBag />}
                variant="outline"
                className="text-xs sm:text-sm font-semibold border-gray-300 dark:border-gray-600"
              >
                Browse All Laptops
              </Button>
            </Link>
            <Link to="/finder">
              <Button
                leftIcon={<FiCompass />}
                variant="ghost"
                className="text-xs sm:text-sm font-semibold"
              >
                Laptop Finder
              </Button>
            </Link>
          </div>

          {/* Popular Categories Grid */}
          <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-3">
              Popular Showroom Categories:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
              <Link
                to="/shop?brand=hp"
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block text-center"
              >
                HP Laptops
              </Link>
              <Link
                to="/shop?brand=apple"
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block text-center"
              >
                Apple MacBooks
              </Link>
              <Link
                to="/shop?brand=dell"
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block text-center"
              >
                Dell XPS & Latitude
              </Link>
              <Link
                to="/shop?brand=lenovo"
                className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors block text-center"
              >
                Lenovo ThinkPads
              </Link>
            </div>
          </div>

          {/* Help Line */}
          <p className="mt-8 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
            <FiPhone size={14} />
            <span>Need assistance? Call Mocha Place showroom: <strong>0104504692</strong></span>
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;
