import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiWifiOff, FiRefreshCw, FiHome, FiCheck } from 'react-icons/fi';
import Button from '../../components/ui/Button';

export const NetworkError = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      // Probe health endpoint
      const response = await fetch('/health', { method: 'GET', cache: 'no-cache' });
      if (response.ok) {
        window.location.reload();
      } else {
        setIsOnline(false);
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Connection Error | Apexbyte Laptops</title>
      </Helmet>

      <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white px-4 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiWifiOff className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            Network Unreachable
          </p>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
            Unable to Connect to Store
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            Your browser cannot reach the Apexbyte e-commerce server. Please check your Wi-Fi, mobile data, or proxy settings.
          </p>

          <div className="p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-left max-w-sm mx-auto mb-8 space-y-1.5">
            <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Troubleshooting Checklist:</span>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Verify Wi-Fi or cellular connection is active</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Disable aggressive ad-blockers or VPN tunnels</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FiCheck size={14} className="text-emerald-500 flex-shrink-0" />
              <span>Browser status: {isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleTestConnection}
              isLoading={isChecking}
              leftIcon={<FiRefreshCw className={isChecking ? 'animate-spin' : ''} />}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
            >
              Test Connection &amp; Retry
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
        </div>
      </div>
    </>
  );
};

export default NetworkError;

