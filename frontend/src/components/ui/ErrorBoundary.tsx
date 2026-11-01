import { Component, ErrorInfo, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiShoppingBag, FiHeadphones } from 'react-icons/fi';
import Button from './Button';
import Card from './Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  variant?: 'full-page' | 'section';
  title?: string;
  message?: string;
  fallback?: ReactNode;
  onReset?: () => void;
  showRetry?: boolean;
  resetKeys?: any[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = 'err_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Structured diagnostic logging for unexpected React rendering errors
    const errorRef = this.state.errorId || 'err_unknown';
    // eslint-disable-next-line no-console
    console.error(`[Apexbyte ErrorBoundary ${errorRef}] Caught component render failure:`, {
      message: error.message,
      name: error.name,
      componentStack: errorInfo.componentStack,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys?.[idx]
      );
      if (hasChanged) {
        this.setState({
          hasError: false,
          error: null,
          errorId: null,
          retryCount: 0,
        });
      }
    }
  }

  handleReset = () => {
    if (this.state.retryCount >= 3) {
      // Prevent infinite auto-reload or retry loops
      window.location.href = '/';
      return;
    }

    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prev.retryCount + 1,
    }));

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { variant = 'section', title, message } = this.props;
    const isFullPage = variant === 'full-page';
    const errorRef = this.state.errorId || 'N/A';
    const isDev = (import.meta as any).env?.DEV;

    const defaultTitle = isFullPage
      ? 'Something Went Wrong on this Page'
      : 'Unable to Load this Section';
    const defaultMessage =
      'Our team has been notified. You can retry the operation or return to the store catalogue.';

    if (isFullPage) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="max-w-xl w-full text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/10">
              <FiAlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 mb-3">
              Application Error
            </span>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
              {title || defaultTitle}
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
              {message || defaultMessage}
            </p>

            <div className="p-3.5 rounded-xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 font-mono">
              <span>Support Reference ID: </span>
              <strong className="text-gray-900 dark:text-white font-bold">{errorRef}</strong>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={this.handleReset}
                leftIcon={<FiRefreshCw className="animate-spin-once" />}
                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md"
              >
                {this.state.retryCount >= 2 ? 'Reload Store' : 'Try Again'}
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                leftIcon={<FiHome />}
                className="text-sm border-gray-300 dark:border-gray-600"
              >
                Go to Homepage
              </Button>

              <Button
                variant="ghost"
                onClick={() => (window.location.href = '/shop')}
                leftIcon={<FiShoppingBag />}
                className="text-sm"
              >
                Browse Laptops
              </Button>
            </div>

            {/* Show technical details strictly in development mode */}
            {isDev && this.state.error && (
              <details className="mt-8 text-left p-4 rounded-xl bg-gray-200 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 text-xs font-mono overflow-auto max-h-60">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-bold mb-2">
                  Developer Stack Trace ({this.state.error.name})
                </summary>
                <p className="text-red-700 dark:text-red-300 mb-2 font-bold">{this.state.error.message}</p>
                <pre className="whitespace-pre-wrap text-[11px] text-gray-700 dark:text-gray-400">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-500">
              <FiHeadphones />
              <span>Need help? Contact Apexbyte Mocha Place Showroom: <strong>0104504692</strong></span>
            </div>
          </div>
        </div>
      );
    }

    // Sectional Fallback Card (prevents entire page from collapsing)
    return (
      <Card className="p-6 text-center border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 my-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
          <FiAlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          {title || defaultTitle}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-4">
          {message || defaultMessage}
        </p>

        <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400 mb-4">
          Ref: <span className="font-semibold">{errorRef}</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={this.handleReset}
            leftIcon={<FiRefreshCw size={14} />}
            className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold"
          >
            Refresh Section
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => (window.location.href = '/shop')}
            className="text-xs"
          >
            Shop Catalog
          </Button>
        </div>

        {isDev && this.state.error && (
          <details className="mt-4 text-left p-3 rounded-lg bg-gray-100 dark:bg-gray-900 border text-[11px] font-mono overflow-auto max-h-40">
            <summary className="cursor-pointer text-red-600 font-bold">Dev Error Info</summary>
            <p className="text-red-500 mt-1">{this.state.error.message}</p>
          </details>
        )}
      </Card>
    );
  }
}

export default ErrorBoundary;

