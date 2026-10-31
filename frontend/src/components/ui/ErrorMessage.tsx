import React from 'react';
import { FiAlertCircle, FiWifiOff, FiClock, FiRefreshCw, FiHelpCircle } from 'react-icons/fi';
import Button from './Button';
import Card from './Card';
import { ApiError } from '../../services/api';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'card' | 'inline' | 'banner';
  className?: string;
  action?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  error,
  onRetry,
  retryLabel = 'Try Again',
  variant = 'card',
  className = '',
  action,
}) => {
  let displayTitle = title;
  let displayMessage = message;
  let requestId: string | undefined;
  let errorCode: string | undefined;
  let isNetwork = false;
  let isTimeout = false;

  if (error instanceof ApiError) {
    requestId = error.requestId;
    errorCode = error.code;
    isNetwork = error.isNetworkError;
    isTimeout = error.isTimeout;
    displayMessage = displayMessage || error.message;

    if (!displayTitle) {
      if (isNetwork) displayTitle = 'Connection Failure';
      else if (isTimeout) displayTitle = 'Request Timed Out';
      else if (error.status === 404) displayTitle = 'Resource Not Found';
      else if (error.status === 403) displayTitle = 'Access Denied';
      else if (error.status >= 500) displayTitle = 'Server Unavailable';
      else displayTitle = 'Operation Failed';
    }
  } else if (error instanceof Error) {
    displayMessage = displayMessage || error.message;
    displayTitle = displayTitle || 'Error';
  } else if (typeof error === 'string') {
    displayMessage = displayMessage || error;
    displayTitle = displayTitle || 'Notice';
  }

  displayTitle = displayTitle || 'Something went wrong';
  displayMessage = displayMessage || 'Unable to complete your request. Please try again or contact support.';

  const IconComponent = isNetwork ? FiWifiOff : isTimeout ? FiClock : FiAlertCircle;

  if (variant === 'inline') {
    return (
      <div
        role="alert"
        className={`flex items-start gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs sm:text-sm ${className}`}
      >
        <IconComponent className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-bold">{displayTitle}</p>
          <p className="mt-0.5 text-xs text-red-700 dark:text-red-300 leading-relaxed">{displayMessage}</p>
          {requestId && (
            <p className="mt-1 text-[10px] font-mono opacity-80">Ref: {requestId}</p>
          )}
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-bold text-red-700 hover:text-red-900 underline shrink-0 cursor-pointer"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={`w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <IconComponent size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base">{displayTitle}</h4>
            <p className="text-xs text-white/90">{displayMessage}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <Button
              size="sm"
              onClick={onRetry}
              leftIcon={<FiRefreshCw size={14} />}
              className="bg-white text-red-700 hover:bg-red-50 font-bold text-xs"
            >
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <Card
      role="alert"
      className={`p-6 sm:p-8 text-center border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 shadow-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
        <IconComponent size={28} />
      </div>

      {errorCode && (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 mb-2">
          {errorCode}
        </span>
      )}

      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
        {displayTitle}
      </h3>

      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-5 leading-relaxed">
        {displayMessage}
      </p>

      {requestId && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 border text-[11px] font-mono text-gray-500 dark:text-gray-400 mb-6">
          <FiHelpCircle size={12} />
          <span>Error Reference: {requestId}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            size="sm"
            onClick={onRetry}
            leftIcon={<FiRefreshCw size={14} />}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm shadow-md"
          >
            {retryLabel}
          </Button>
        )}
        {action}
      </div>
    </Card>
  );
};

export default ErrorMessage;

