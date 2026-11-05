import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiShield, FiUser } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Safely extract and sanitize redirect destination
  const fromParam = (location.state as any)?.from || searchParams.get('from');
  const isSessionExpired = Boolean((location.state as any)?.sessionExpired);
  const safeRedirect =
    fromParam && typeof fromParam === 'string' && fromParam.startsWith('/') && !fromParam.startsWith('//')
      ? fromParam
      : null;

  // If accessing from an administrative route or session expiry, redirect immediately to the dedicated Admin Login
  if (
    (fromParam && typeof fromParam === 'string' && fromParam.startsWith('/admin')) ||
    isSessionExpired ||
    searchParams.get('admin') === 'true' ||
    searchParams.get('role') === 'admin'
  ) {
    return <Navigate to="/admin/login" replace state={location.state} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const user = response.data.user;
      setAuth(user, response.data.accessToken, response.data.refreshToken);
      toast.success('Login successful!');

      if (safeRedirect) {
        navigate(safeRedirect, { replace: true });
      } else if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <Card.Body>
        {/* Portal Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-gray-800 p-1 mb-6 border border-slate-200 dark:border-gray-700">
          <div className="flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-xs flex items-center justify-center gap-1.5">
            <FiUser className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>Customer Sign In</span>
          </div>
          <Link
            to="/admin/login"
            className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <FiShield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Admin Portal</span>
          </Link>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5 sm:mb-2">Welcome Back</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Sign in to your customer account</p>
          {safeRedirect && !isSessionExpired && (
            <p className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-950/40 py-1 px-2 rounded-lg border border-primary-200 dark:border-primary-800">
              Please sign in to continue to your requested page
            </p>
          )}
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs sm:text-sm text-red-800 dark:text-red-300"
          >
            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Sign In Notice</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<FiMail className="w-5 h-5 text-gray-400" />}
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>

        <div className="text-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <FiShield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Store Administrator? Sign in to Admin Portal &rarr;</span>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Login;
