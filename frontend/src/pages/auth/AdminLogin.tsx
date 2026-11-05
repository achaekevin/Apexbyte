import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { setAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Safely extract redirect destination
  const fromParam = (location.state as any)?.from || searchParams.get('from');
  const isSessionExpired = Boolean((location.state as any)?.sessionExpired || searchParams.get('sessionExpired') === 'true');
  const safeRedirect =
    fromParam && typeof fromParam === 'string' && fromParam.startsWith('/') && !fromParam.startsWith('//')
      ? fromParam
      : '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailError(null);
    setPasswordError(null);
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const user = response.data.user;

      // Strict role check: Customers cannot log in through the Admin Portal
      if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        logout();
        const accessDeniedMsg =
          'Access Denied: This account does not have administrator privileges. Only administrators registered and configured by an active administrator can access the admin dashboard.';
        setErrorMessage(accessDeniedMsg);
        toast.error('Access Denied: Administrator account required.');
        return;
      }

      setAuth(user, response.data.accessToken, response.data.refreshToken);
      toast.success(`Welcome back, ${user.firstName || 'Administrator'}!`);
      navigate(safeRedirect, { replace: true });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Authentication failed. Please verify your administrator credentials.';
      setErrorMessage(msg);
      toast.error(msg);

      const lower = msg.toLowerCase();
      if (lower.includes('password')) {
        setPasswordError(msg);
      } else if (lower.includes('email') || lower.includes('account')) {
        setEmailError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-amber-200/80 dark:border-amber-800/60 shadow-lg">
      <Card.Body>
        {/* Admin Portal Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
            <FiShield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Store Administrator Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5 sm:mb-2">
            Admin Sign In
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Sign in with your configured staff credentials to access the store management dashboard
          </p>

          {isSessionExpired && (
            <div
              role="alert"
              className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-300 text-left"
            >
              <FiAlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Your administrator session has expired. Please re-enter your credentials to resume.</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs sm:text-sm text-red-800 dark:text-red-300"
          >
            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Access Restriction</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@apexbyte.co.ke"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
              if (errorMessage) setErrorMessage(null);
            }}
            error={emailError || undefined}
            leftIcon={<FiMail className="w-5 h-5 text-gray-400" />}
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
              if (errorMessage) setErrorMessage(null);
            }}
            error={passwordError || undefined}
            leftIcon={<FiLock className="w-5 h-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            }
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Remember session</span>
            </label>
            <Link to="/forgot-password" className="text-primary-600 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full shadow-md" size="lg" isLoading={isLoading}>
            Sign In to Dashboard
          </Button>
        </form>

        {/* Security Isolation Notice - Absolutely NO Sign-Up Button */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <FiShield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Public Registration Disabled</span>
            </div>
            <p className="leading-relaxed">
              Administrator accounts cannot be self-registered. New administrators must be added and configured by an active administrator inside the <strong>Store Management &rarr; Admin Team</strong> dashboard.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <Link
              to="/login"
              className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
            >
              Customer Sign In &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AdminLogin;

