import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiShield } from 'react-icons/fi';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your registered email address.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response: any = await authService.forgotPassword(cleanEmail);
      const msg =
        response?.data?.message ||
        response?.message ||
        'If this email is registered in our system, password reset instructions have been sent. Please check your inbox and spam folder.';

      setStatusMessage({
        type: 'success',
        text: msg,
      });
      toast.success('Password reset link dispatched!');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to process password reset request. Please check the email address and try again.';

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
                Forgot Your Password?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                Enter your registered administrator or customer email and we will send you a secure link to reset your password.
              </p>
            </div>

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
                    {statusMessage.type === 'success' ? 'Password Reset Link Sent' : 'Reset Request Failed'}
                  </span>
                  <p className="mt-0.5 leading-relaxed">{statusMessage.text}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="e.g. admin@apexbyte.co.ke"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (statusMessage) setStatusMessage(null);
                }}
                leftIcon={<FiMail className="w-5 h-5 text-gray-400" />}
                required
                autoComplete="email"
              />

              <Button
                type="submit"
                className="w-full shadow-md"
                size="lg"
                isLoading={isLoading}
              >
                Send Password Reset Link
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2.5 text-xs">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:underline font-semibold"
              >
                <FiArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Admin Sign In</span>
              </Link>
              <Link
                to="/login"
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Customer Sign In
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
