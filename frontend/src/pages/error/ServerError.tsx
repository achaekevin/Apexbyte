import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';
import Button from '../../components/ui/Button';

export const ServerError = () => {
  const location = useLocation();
  const requestId = (location.state as any)?.requestId || (location.state as any)?.errorRef;

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title>500 - Server Error | Apexbyte Laptops</title>
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiAlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 mb-3">
            HTTP 500 • Internal Server Error
          </span>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            Server Encountered an Issue
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
            An unexpected server-side condition prevented this request from completing. Our technical team has been notified.
          </p>

          {requestId && (
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border text-xs font-mono text-gray-600 dark:text-gray-300 max-w-xs mx-auto mb-8">
              <span>Diagnostic Reference: </span>
              <strong className="text-gray-900 dark:text-white block mt-0.5">{requestId}</strong>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleReload}
              leftIcon={<FiRefreshCw />}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
            >
              Retry / Reload Page
            </Button>
            <Link to="/">
              <Button
                leftIcon={<FiHome />}
                variant="outline"
                className="text-xs sm:text-sm border-gray-300 dark:border-gray-600"
              >
                Return Home
              </Button>
            </Link>
            <Link to="/shop">
              <Button
                leftIcon={<FiShoppingBag />}
                variant="ghost"
                className="text-xs sm:text-sm"
              >
                Browse Laptops
              </Button>
            </Link>
            <a
              href="https://wa.me/254104504692?text=Hello%20Apexbyte,%20I%20encountered%20a%20server%20error%20on%20the%20website"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 text-xs sm:text-sm font-bold transition-all"
            >
              <FiMessageSquare />
              <span>WhatsApp Showroom</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServerError;

