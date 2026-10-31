import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiLock, FiHome, FiArrowLeft, FiUser, FiShoppingBag } from 'react-icons/fi';
import Button from '../../components/ui/Button';

export const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>403 - Access Forbidden | Apexbyte Laptops</title>
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiLock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
            HTTP 403 • Restricted Area
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Access Forbidden
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            You do not have the required administrative permissions to access this page. If you believe this is a mistake, please sign in with an authorized administrator account.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              leftIcon={<FiArrowLeft />}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm border-gray-300 dark:border-gray-600"
            >
              Go Back
            </Button>
            <Link to="/">
              <Button
                leftIcon={<FiHome />}
                size="sm"
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
              >
                Homepage
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                leftIcon={<FiUser />}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm border-gray-300 dark:border-gray-600"
              >
                My Account
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                leftIcon={<FiShoppingBag />}
                variant="ghost"
                size="sm"
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

export default Forbidden;

