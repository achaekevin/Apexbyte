import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiLogIn, FiHome, FiUserPlus, FiShoppingBag } from 'react-icons/fi';
import Button from '../../components/ui/Button';

export const Unauthorized = () => {
  const location = useLocation();
  const from = (location.state as any)?.from || '/dashboard';

  return (
    <>
      <Helmet>
        <title>401 - Authentication Required | Apexbyte Laptops</title>
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiLogIn className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
            HTTP 401 • Login Required
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Authentication Required
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Please log in to your account to view your customer orders, manage your delivery address, or complete your checkout.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to={`/login?from=${encodeURIComponent(from)}`}>
              <Button
                leftIcon={<FiLogIn />}
                size="md"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Log In to Account
              </Button>
            </Link>
            <Link to="/register">
              <Button
                leftIcon={<FiUserPlus />}
                variant="outline"
                size="md"
                className="text-xs sm:text-sm font-semibold border-gray-300 dark:border-gray-600"
              >
                Create Account
              </Button>
            </Link>
            <Link to="/">
              <Button
                leftIcon={<FiHome />}
                variant="ghost"
                size="md"
                className="text-xs sm:text-sm"
              >
                Go to Homepage
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                leftIcon={<FiShoppingBag />}
                variant="ghost"
                size="md"
                className="text-xs sm:text-sm"
              >
                Browse Store
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;

