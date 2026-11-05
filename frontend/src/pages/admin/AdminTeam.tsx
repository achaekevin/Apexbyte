import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiUserPlus,
  FiLock,
  FiKey,
  FiMail,
  FiPhone,
  FiCheck,
  FiX,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import adminService, { AdminUser, CreateAdminData } from '../../services/adminService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { formatDate } from '../../utils/helpers';

const INITIAL_FORM: CreateAdminData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'ADMIN',
  password: '',
};

const AdminTeam = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAdminData>(INITIAL_FORM);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Success credentials screen state
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    password: string;
    fullName: string;
    role: string;
  } | null>(null);

  // Password reset modal state
  const [resetTargetAdmin, setResetTargetAdmin] = useState<AdminUser | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStatusMessage, setResetStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Fetch all admins
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => adminService.getAdmins(),
  });

  const admins: AdminUser[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? (response as any)
    : [];

  // Create admin mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAdminData) => adminService.createAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      // Keep credentials visible for the admin to copy
      setCreatedCredentials({
        email: formData.email,
        password: formData.password,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        role: formData.role,
      });
      toast.success(`Administrator created successfully!`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to create administrator';
      toast.error(msg);
    },
  });

  // Toggle active status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateAdmin(id, { isActive }),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast.success(
        variables.isActive
          ? 'Administrator account activated'
          : 'Administrator account deactivated'
      );
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update administrator status');
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminService.resetAdminPassword(id, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast.success('Administrator password updated successfully!');
      setResetStatusMessage({
        type: 'success',
        text: 'Administrator password reset successfully! The staff member will use this new password on their next login.',
      });
      setTimeout(() => {
        setResetTargetAdmin(null);
        setNewResetPassword('');
        setConfirmResetPassword('');
        setResetStatusMessage(null);
      }, 1500);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to reset password. Please check requirements and try again.';
      toast.error(msg);
      setResetStatusMessage({
        type: 'error',
        text: msg,
      });
    },
  });

  // Delete admin mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      toast.success('Administrator removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove administrator');
    },
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pwd }));
    setConfirmPassword(pwd);
    toast.success('Generated secure password!');
  };

  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM);
    setConfirmPassword('');
    setCreatedCredentials(null);
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('First name, last name, and email are required');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatusMessage(null);
    if (!resetTargetAdmin) return;

    if (newResetPassword.length < 8) {
      const msg = 'New password must be at least 8 characters long.';
      toast.error(msg);
      setResetStatusMessage({ type: 'error', text: msg });
      return;
    }

    if (newResetPassword !== confirmResetPassword) {
      const msg = 'Passwords do not match. Please verify both fields.';
      toast.error(msg);
      setResetStatusMessage({ type: 'error', text: msg });
      return;
    }

    resetPasswordMutation.mutate({
      id: resetTargetAdmin.id,
      newPassword: newResetPassword,
    });
  };

  const handleDelete = (admin: AdminUser) => {
    if (admin.id === currentUser?.id) {
      toast.error('You cannot delete your own administrator account');
      return;
    }

    if (
      confirm(
        `Are you sure you want to remove administrator "${admin.fullName}" (${admin.email})? They will immediately lose access to the admin dashboard.`
      )
    ) {
      deleteMutation.mutate(admin.id);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <>
      <Helmet>
        <title>Administrator Team & Access - Apexbyte Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400">
                <FiShield size={22} />
              </span>
              Administrator Team & Access Control
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Only authenticated administrators can add and provision staff accounts with access to the admin dashboard.
            </p>
          </div>

          <Button
            onClick={handleOpenAddModal}
            leftIcon={<FiUserPlus size={16} />}
            className="shadow-md"
          >
            Add New Administrator
          </Button>
        </div>

        {/* Security Policy Notice Card */}
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <FiLock size={18} />
          </div>
          <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 space-y-1">
            <p className="font-bold">Strict Role Isolation & Provisioning Policy:</p>
            <p className="text-blue-800/90 dark:text-blue-300">
              Public self-registration on this website is strictly restricted to regular customers. A user can{' '}
              <strong>never</strong> register themselves as an administrator through the public sign-up form.
              To grant someone administrator privileges, an already logged-in administrator must add them below with set credentials.
            </p>
          </div>
        </div>

        {/* Administrators List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <ErrorMessage
            title="Failed to Load Administrators"
            error={error}
            onRetry={() => refetch()}
            retryLabel="Retry"
          />
        ) : admins.length === 0 ? (
          <Card className="text-center py-12">
            <FiShield className="mx-auto text-gray-400 mb-3" size={40} />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              No Administrators Found
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Add your first team member using the button above.
            </p>
          </Card>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 min-w-[700px]">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3.5">Administrator</th>
                    <th className="px-4 py-3.5">Assigned Role</th>
                    <th className="px-4 py-3.5">Account Status</th>
                    <th className="px-4 py-3.5">Contact</th>
                    <th className="px-4 py-3.5">Added Date / Last Login</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {admins.map((admin) => {
                    const isSelf = admin.id === currentUser?.id;
                    const isSuperAdmin = admin.role === 'SUPER_ADMIN';

                    return (
                      <tr
                        key={admin.id}
                        className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${
                          !admin.isActive ? 'opacity-60 bg-gray-50/40 dark:bg-gray-800/40' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-800 text-sm">
                              {admin.firstName?.charAt(0)}
                              {admin.lastName?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                  {admin.fullName}
                                </span>
                                {isSelf && (
                                  <span className="text-[10px] bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300 border border-primary-200 dark:border-primary-800 px-1.5 py-0.2 rounded font-bold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                <FiMail size={11} /> {admin.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-4">
                          {isSuperAdmin ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 shadow-2xs">
                              <FiShield size={12} className="text-amber-600 dark:text-amber-400" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
                              <FiShield size={12} className="text-blue-600 dark:text-blue-400" />
                              Administrator
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            disabled={isSelf || toggleStatusMutation.isPending}
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                id: admin.id,
                                isActive: !admin.isActive,
                              })
                            }
                            title={
                              isSelf
                                ? 'Cannot deactivate your own account'
                                : admin.isActive
                                ? 'Click to deactivate access'
                                : 'Click to activate access'
                            }
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                              admin.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 hover:bg-red-100'
                            } ${isSelf ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                admin.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                              }`}
                            />
                            {admin.isActive ? 'Active' : 'Deactivated'}
                          </button>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-4 text-xs text-gray-500">
                          {admin.phone ? (
                            <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                              <FiPhone size={12} /> {admin.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No phone set</span>
                          )}
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-4 text-xs">
                          <div className="text-gray-700 dark:text-gray-300 font-medium">
                            Added: {formatDate(admin.createdAt)}
                          </div>
                          <div className="text-gray-400 text-[11px] flex items-center gap-1 mt-0.5">
                            <FiClock size={10} />
                            {admin.lastLogin
                              ? `Last active: ${formatDate(admin.lastLogin)}`
                              : 'Never logged in yet'}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setResetTargetAdmin(admin);
                                setNewResetPassword('');
                                setConfirmResetPassword('');
                                setShowResetPassword(false);
                              }}
                              title="Reset Password for this Admin"
                              className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                            >
                              <FiKey size={16} />
                            </button>

                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => handleDelete(admin)}
                                disabled={deleteMutation.isPending}
                                title="Remove Administrator"
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add New Administrator Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 my-8 max-h-[92vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                    <FiUserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Add New Administrator
                    </h3>
                    <p className="text-xs text-gray-500">
                      Provision credentials for a new authorized staff member
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {createdCredentials ? (
                /* Post-Creation Credentials Card */
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <FiCheckCircle size={18} className="text-emerald-600" />
                      Administrator Successfully Created!
                    </div>
                    <p className="text-xs mt-1 text-emerald-700 dark:text-emerald-400">
                      {createdCredentials.fullName} can now immediately log in at{' '}
                      <strong>/login</strong> and access the admin dashboard with the following credentials:
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Login Email:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {createdCredentials.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdCredentials.email, 'Email')}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 font-sans"
                      >
                        <FiCopy size={12} /> Copy
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-2.5">
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase">Set Password:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {createdCredentials.password}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(createdCredentials.password, 'Password')}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 font-sans"
                      >
                        <FiCopy size={12} /> Copy
                      </button>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 text-[11px] font-sans text-gray-500">
                      Role assigned: <strong>{createdCredentials.role}</strong>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setCreatedCredentials(null);
                        setIsAddModalOpen(false);
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form */
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        First Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="e.g. Sarah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Last Name *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="e.g. Mwangi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Login Email Address *
                    </label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. sarah@laptopstore.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number (Optional)
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254 700 000 000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Administrator Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="ADMIN">Administrator (Standard Admin)</option>
                        {currentUser?.role === 'SUPER_ADMIN' && (
                          <option value="SUPER_ADMIN">Super Administrator (Full Ownership)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Password Configuration */}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Set Initial Password *
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold flex items-center gap-1"
                      >
                        <FiRefreshCw size={12} /> Generate Secure Password
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 8 characters"
                        rightIcon={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password *
                      </label>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      isLoading={createMutation.isPending}
                      leftIcon={<FiCheck />}
                    >
                      Create Administrator
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {resetTargetAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FiKey size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Reset Admin Password
                    </h3>
                    <p className="text-xs text-gray-500">{resetTargetAdmin.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  <FiX size={18} />
                </button>
              </div>

              {resetStatusMessage && (
                <div
                  role="alert"
                  className={`mb-4 p-3.5 rounded-xl flex items-start gap-2.5 text-xs border ${
                    resetStatusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {resetStatusMessage.type === 'success' ? (
                    <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold block">
                      {resetStatusMessage.type === 'success' ? 'Password Reset Complete' : 'Reset Failed'}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{resetStatusMessage.text}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    New Password *
                  </label>
                  <Input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showResetPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password *
                  </label>
                  <Input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    value={confirmResetPassword}
                    onChange={(e) => setConfirmResetPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetTargetAdmin(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={resetPasswordMutation.isPending}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminTeam;
