import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiUser,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiCheck,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiSave,
  FiMapPin,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import authService from '../../services/authService';

const AdminSettings = () => {
  const { user, updateUser } = useAuthStore();

  // Profile / Credentials state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active tab: 'profile' | 'security' | 'store'
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'store'>('profile');

  // Password strength checklist
  const passwordCriteria = {
    length: passwordData.newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(passwordData.newPassword),
    hasLower: /[a-z]/.test(passwordData.newPassword),
    hasNumber: /[0-9]/.test(passwordData.newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(passwordData.newPassword),
  };
  const isPasswordStrong =
    passwordCriteria.length &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial;

  // Handle Profile Update (Credentials: Email, Name, Phone)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    try {
      const response: any = await api.put('/users/profile', {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: profileData.email.trim().toLowerCase(),
        phone: profileData.phone.trim(),
      });

      const updated = response?.data || response;
      updateUser({
        firstName: updated.firstName || profileData.firstName,
        lastName: updated.lastName || profileData.lastName,
        email: updated.email || profileData.email,
        phone: updated.phone || profileData.phone,
      });

      toast.success('Admin credentials and profile updated successfully!');
      setProfileMessage({
        type: 'success',
        text: 'Credentials updated. Use your new email for all future logins.',
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update credentials. Please try again.';
      toast.error(errorMsg);
      setProfileMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const msg = 'New password and confirmation password do not match.';
      toast.error(msg);
      setPasswordMessage({ type: 'error', text: msg });
      return;
    }

    if (!isPasswordStrong) {
      const msg =
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.';
      toast.error(msg);
      setPasswordMessage({ type: 'error', text: msg });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      toast.success('Admin password updated successfully! Please use it for future logins.');
      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully. Your new password is now active.',
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update password. Check your current password and try again.';
      toast.error(errorMsg);
      setPasswordMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Settings & Credentials - Apexbyte Laptops</title>
      </Helmet>

      <div className="space-y-6 sm:space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-primary-900 to-indigo-950 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl border border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-500/30">
                <FiShield className="w-3.5 h-3.5" />
                {user?.role || 'SUPER_ADMIN'}
              </span>
              <Badge variant="success" size="sm">
                Active Account
              </Badge>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Admin Settings &amp; Credentials
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
              Manage your administrator login email, personal contact information, and security password for accessing the Apexbyte management dashboard.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FiUser className="w-4 h-4" />
            <span>Login Credentials &amp; Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'security'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FiLock className="w-4 h-4" />
            <span>Password &amp; Security</span>
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'store'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <FiMapPin className="w-4 h-4" />
            <span>Store Configuration</span>
          </button>
        </div>

        {/* Tab 1: Profile & Login Email */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiMail className="text-primary-500" />
                      Login Email &amp; Account Details
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Changing your email address updates your administrator login identifier for future logins.
                    </p>
                  </div>
                </div>

                {profileMessage && (
                  <div
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm ${
                      profileMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <FiCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{profileMessage.text}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        First Name
                      </label>
                      <Input
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, firstName: e.target.value }))
                        }
                        placeholder="Admin First Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                        Last Name
                      </label>
                      <Input
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({ ...prev, lastName: e.target.value }))
                        }
                        placeholder="Admin Last Name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                      <span>Administrator Login Email</span>
                      <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400">
                        * Used for future system login
                      </span>
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="e.g. yourname@domain.com"
                      required
                    />
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      If you change this email from the default (<code>admin@laptopstore.com</code>), use this new email the next time you log in.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <FiPhone className="text-gray-400" />
                      <span>Phone Number (Optional)</span>
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="e.g. +254 712 345 678"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isUpdatingProfile}
                      leftIcon={<FiSave />}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Profile Sidebar Summary Card */}
            <div>
              <Card className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-850">
                <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-primary-500/20">
                    {user?.firstName?.charAt(0) || 'A'}
                  </div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {user?.email}
                  </p>
                  <div className="mt-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <FiCheck className="w-3.5 h-3.5" /> Verified Administrator
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Access Scope:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Full Store Administration
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiLock className="text-primary-500" />
                      Change Login Password
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Update your secret login password. You will use this new password to log in next time.
                    </p>
                  </div>
                </div>

                {passwordMessage && (
                  <div
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <FiCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{passwordMessage.text}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                        }
                        placeholder="Enter current password (e.g. Admin@12345)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Toggle password visibility"
                      >
                        {showCurrentPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="Enter your new strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        placeholder="Repeat new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    {passwordData.confirmPassword &&
                      passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-xs text-rose-500 font-semibold mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>

                  {/* Password Checklist */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1.5">
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <FiCheck className="w-3.5 h-3.5" /> At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <FiCheck className="w-3.5 h-3.5" /> One uppercase letter (A-Z)
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <FiCheck className="w-3.5 h-3.5" /> One lowercase letter (a-z)
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <FiCheck className="w-3.5 h-3.5" /> One numeric digit (0-9)
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordCriteria.hasSpecial ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
                        }`}
                      >
                        <FiCheck className="w-3.5 h-3.5" /> One special character (!@#$%^&amp;*)
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button
                      type="submit"
                      isLoading={isUpdatingPassword}
                      leftIcon={<FiLock />}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            <div>
              <Card className="p-4 sm:p-6 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2 text-sm">
                  <FiAlertCircle className="w-4 h-4 text-amber-600" />
                  Security Notice
                </h3>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  As a store administrator, your account has full authority to create products, manage pricing, review orders, and configure M-Pesa callbacks. Keep your password confidential.
                </p>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Store Configuration Overview */}
        {activeTab === 'store' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
                Kisii CBD Showroom &amp; E-Commerce Operational Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                  <span className="font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Physical Showroom Location:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Mocha Place, 2nd Floor, Hospital Road, Kisii Town, Kenya
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                  <span className="font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Store Hotline &amp; WhatsApp:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    +254 104 504 692
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                  <span className="font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Supported Currencies:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Kenyan Shilling (KES / KSh)
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                  <span className="font-bold text-gray-500 dark:text-gray-400 block mb-1">
                    Applicable VAT Rate:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    8% Standard Computer Hardware VAT
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AdminSettings;
