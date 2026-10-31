import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiTool, FiRefreshCw, FiHome, FiClock, FiPhone } from 'react-icons/fi';
import Button from '../../components/ui/Button';

export const ServiceUnavailable = () => {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.location.reload();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Helmet>
        <title>503 - Service Temporarily Unavailable | Apexbyte Laptops</title>
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiTool className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
            HTTP 503 • System Maintenance
          </span>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            Service Temporarily Unavailable
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Our systems or cloud dependencies are currently performing maintenance or processing heavy traffic. We expect to be fully back online shortly.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 mb-8">
            <FiClock />
            <span>Auto-refreshing in: <strong>{countdown}s</strong></span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => window.location.reload()}
              leftIcon={<FiRefreshCw />}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
            >
              Check Now
            </Button>
            <Link to="/">
              <Button
                leftIcon={<FiHome />}
                variant="outline"
                className="text-xs sm:text-sm border-gray-300 dark:border-gray-600"
              >
                Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <FiPhone />
            <span>Urgent showroom inquiries: <strong>0104504692</strong></span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceUnavailable;

