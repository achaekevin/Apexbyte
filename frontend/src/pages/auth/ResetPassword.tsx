import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Missing password reset token. Please open the link received in your email or request a new reset link.',
      });
      return;
    }

    if (!password || password.length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({
        type: 'error',
        text: 'Passwords do not match. Please verify that both fields match exactly.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await authService.resetPassword(token, password);
      const msg =
        response?.data?.message ||
        response?.message ||
        'Password has been reset successfully! Your new credentials are now active.';

      setStatusMessage({
        type: 'success',
        text: msg,
      });
      toast.success('Password reset successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. The reset link may have expired or is invalid. Please request a new link.';

      setStatusMessage({
        type: 'error',
        text: errorMsg,
      });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl">
          <Card.Body>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mb-3">
                <FiShield className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Set New Password
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                Configure your new password (minimum 8 characters). This password will be required for subsequent logins.
              </p>
            </div>

            {/* If token is missing entirely */}
            {!token && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
              >
                <FiAlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold block text-sm">Reset Token Not Found</span>
                  <p className="mt-0.5 leading-relaxed">
                    No reset token was detected in the URL. Please make sure you clicked the full link sent to your email.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="inline-block mt-2 font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Request a new password reset link &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Status Message Banner (Success or Error) */}
            {statusMessage && (
              <div
                role="alert"
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-bold block text-sm">
                    {statusMessage.type === 'success' ? 'Password Reset Successful!' : 'Password Reset Failed'}
                  </span>
                  <p className="mt-0.5 leading-relaxed">{statusMessage.text}</p>

                  {statusMessage.type === 'success' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/admin/login"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        <span>Sign In as Admin</span>
                        <FiArrowRight size={14} />
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                      >
                        <span>Customer Sign In</span>
                      </Link>
                    </div>
                  )}

                  {statusMessage.type === 'error' && (
                    <div className="mt-2">
                      <Link
                        to="/forgot-password"
                        className="font-bold text-rose-700 dark:text-rose-300 hover:underline inline-flex items-center gap-1 text-xs"
                      >
                        <span>Request a fresh reset link</span>
                        <FiArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {statusMessage?.type !== 'success' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (statusMessage) setStatusMessage(null);
                    }}
                    leftIcon={<FiLock className="w-5 h-5 text-gray-400" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    }
                    required
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Accepts any combination of characters as long as it has at least 8 characters.
                  </p>
                </div>

                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (statusMessage) setStatusMessage(null);
                  }}
                  leftIcon={<FiLock className="w-5 h-5 text-gray-400" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  }
                  required
                />

                <Button
                  type="submit"
                  className="w-full shadow-md"
                  size="lg"
                  isLoading={isLoading}
                  disabled={!token}
                >
                  Save New Password
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
              <Link
                to="/admin/login"
                className="text-primary-600 dark:text-primary-400 hover:underline font-semibold"
              >
                Return to Admin Sign In
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
