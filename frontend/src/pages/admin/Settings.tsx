import React, { useState, useEffect } from 'react';
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
  FiVolume2,
  FiLayout,
  FiTruck,
  FiAward,
  FiShare2,
  FiRefreshCw,
  FiCamera,
  FiUpload,
  FiTrash2,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import authService from '../../services/authService';
import userService from '../../services/userService';
import settingService from '../../services/settingService';
import { DEFAULT_PUBLIC_SETTINGS } from '../../hooks/useSettings';

type SettingsTab =
  | 'credentials'
  | 'announcement'
  | 'hero'
  | 'contact'
  | 'commerce'
  | 'badges'
  | 'social';

const AdminSettings = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('credentials');

  // Admin Profile & Credentials
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin Profile Picture (Avatar) State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Camera State & Refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Admin Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    strength?: PasswordStrengthInfo;
  } | null>(null);

  // Public Storefront Configuration Settings (All dynamically editable without code changes)
  const [storeSettings, setStoreSettings] = useState(DEFAULT_PUBLIC_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Load existing store settings from backend
  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      setIsLoadingSettings(true);
      try {
        const data = await settingService.getPublicSettings();
        if (isMounted && data) {
          setStoreSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        if (isMounted) setIsLoadingSettings(false);
      }
    };
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync avatar with authStore user changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Start Camera
  const handleStartCamera = async () => {
    setCameraError(null);
    setCapturedPhoto(null);
    setIsCameraOpen(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your current browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      setCameraStream(stream);

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      const errorMsg =
        err?.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : err?.message || 'Unable to access camera device.';
      setCameraError(errorMsg);
      toast.error(errorMsg);
    }
  };

  // Stop Camera
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setCameraError(null);
  };

  // Capture Photo Snapshot from video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth || 480, video.videoHeight || 480);

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Center crop to 1:1 square
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);

    // Stop camera video stream once photo is snapped
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Retake live photo
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    handleStartCamera();
  };

  // Save the captured camera photo
  const handleSaveCapturedPhoto = async () => {
    if (!capturedPhoto) return;
    setIsUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      const res = await userService.updateAvatarBase64(capturedPhoto);
      const newAvatarUrl = res.data?.avatar || res.avatar || capturedPhoto;

      updateUser({ avatar: newAvatarUrl });
      setAvatarPreview(newAvatarUrl);
      handleStopCamera();

      const successMsg =
        'Profile picture captured and updated successfully! This picture is securely saved in your database profile and persists across logouts and page refreshes.';
      setAvatarMessage({ type: 'success', text: successMsg });
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save profile picture from camera. Please try again.';
      setAvatarMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle File Upload from Device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Image size must be less than 5MB.';
      toast.error(msg);
      setAvatarMessage({ type: 'error', text: msg });
      return;
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      const msg = 'Invalid file type. Please select a JPEG, PNG, or WebP image.';
      toast.error(msg);
      setAvatarMessage({ type: 'error', text: msg });
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      const res = await userService.uploadAvatar(file);
      const newAvatarUrl = res.data?.avatar || res.avatar;

      updateUser({ avatar: newAvatarUrl });
      setAvatarPreview(newAvatarUrl);

      const successMsg =
        'Profile picture uploaded successfully! It is saved to your account in the database and will persist across logouts and page refreshes.';
      setAvatarMessage({ type: 'success', text: successMsg });
      toast.success('Profile picture updated!');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to upload profile picture from device. Please try again.';
      setAvatarMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setIsUploadingAvatar(true);
    setAvatarMessage(null);

    try {
      await userService.removeAvatar();
      updateUser({ avatar: undefined });
      setAvatarPreview(null);
      setAvatarMessage({
        type: 'success',
        text: 'Profile picture removed. Your initials will now be displayed.',
      });
      toast.success('Profile picture removed.');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || 'Failed to remove profile picture.';
      setAvatarMessage({ type: 'error', text: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

interface PasswordStrengthInfo {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  badgeBg: string;
  progressBarClass: string;
  percentage: number;
  feedback: string;
}

const evaluatePasswordStrength = (pwd: string): PasswordStrengthInfo => {
  if (!pwd || pwd.length < 8) {
    return {
      score: 1,
      label: 'Weak',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700',
      progressBarClass: 'bg-rose-500',
      percentage: 20,
      feedback: 'Password must be at least 8 characters long.',
    };
  }

  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const isLong = pwd.length >= 12;

  const points = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;

  if (points <= 1) {
    return {
      score: 1,
      label: 'Weak',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
      progressBarClass: 'bg-amber-500',
      percentage: 35,
      feedback: 'Basic strength. You can use this password, but adding mixed case, numbers, or special symbols will make it stronger.',
    };
  } else if (points === 2 || points === 3) {
    return {
      score: 2,
      label: 'Fair',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
      progressBarClass: 'bg-blue-500',
      percentage: 65,
      feedback: 'Good balance. Adding special characters or reaching 12+ characters can achieve maximum rating.',
    };
  } else if (points === 4) {
    return {
      score: 3,
      label: 'Good',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
      progressBarClass: 'bg-emerald-500',
      percentage: 85,
      feedback: 'Strong password. Your administrator account is well protected.',
    };
  } else {
    return {
      score: 4,
      label: 'Strong',
      badgeBg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-400 dark:border-emerald-600',
      progressBarClass: 'bg-emerald-600',
      percentage: 100,
      feedback: 'Maximum cryptographic strength. Excellent protection for store administration.',
    };
  }
};

  // Handle Profile Update (Credentials: Email, Name, Phone)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const cleanEmail = profileData.email.trim();

    try {
      const response: any = await api.put('/users/profile', {
        firstName: profileData.firstName.trim(),
        lastName: profileData.lastName.trim(),
        email: cleanEmail,
        phone: profileData.phone.trim(),
      });

      const updated = response?.data || response;
      const finalEmail = updated.email || cleanEmail;

      updateUser({
        firstName: updated.firstName || profileData.firstName,
        lastName: updated.lastName || profileData.lastName,
        email: finalEmail,
        phone: updated.phone || profileData.phone,
      });

      toast.success('Admin email and profile updated successfully!');
      setProfileMessage({
        type: 'success',
        text: `Administrator login email updated to "${finalEmail}". This email is now configured for your next login to access the admin dashboard.`,
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

    // Accept any password as long as it is at least 8 characters
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      const msg = 'Password must be at least 8 characters long.';
      toast.error(msg);
      setPasswordMessage({ type: 'error', text: msg });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const msg = 'New password and confirmation password do not match.';
      toast.error(msg);
      setPasswordMessage({ type: 'error', text: msg });
      return;
    }

    const strength = evaluatePasswordStrength(passwordData.newPassword);
    setIsUpdatingPassword(true);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      toast.success('Admin password updated successfully! Configured for your next login.');
      setPasswordMessage({
        type: 'success',
        text: 'Admin password updated and configured successfully. You will use this new password the next time you log in to the admin dashboard.',
        strength,
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

  // Save Storefront Settings to database
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      await settingService.updateSettings(storeSettings);

      // Invalidate public settings query across the entire app
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });

      toast.success('Storefront configuration saved and published live!');
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save storefront settings. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const tabs = [
    { id: 'credentials', label: 'Admin Credentials & Login', icon: FiUser },
    { id: 'announcement', label: 'Notice & Announcement Bar', icon: FiVolume2 },
    { id: 'hero', label: 'Homepage Hero & Headlines', icon: FiLayout },
    { id: 'contact', label: 'Showroom & Contact Info', icon: FiMapPin },
    { id: 'commerce', label: 'Shipping, VAT & Pricing', icon: FiTruck },
    { id: 'badges', label: 'Trust Badges & Guarantees', icon: FiAward },
    { id: 'social', label: 'Social Channels', icon: FiShare2 },
  ];

  return (
    <>
      <Helmet>
        <title>Store Configuration & Admin Settings - Apexbyte Laptops</title>
      </Helmet>

      <div className="space-y-6 sm:space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-sm border border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-bold uppercase tracking-wider border border-primary-500/30">
                <FiShield className="w-3.5 h-3.5" />
                {user?.role || 'SUPER_ADMIN'}
              </span>
              <Badge variant="success" size="sm">
                Live Storefront Control Active
              </Badge>
              {isLoadingSettings && (
                <span className="inline-flex items-center gap-1.5 text-xs text-primary-200 ml-2">
                  <FiRefreshCw className="animate-spin w-3 h-3" />
                  Syncing settings...
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Storefront &amp; Admin Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Configure everything displayed on the public website (announcements, contact numbers, showroom address, shipping costs, headlines, and your administrator login credentials) directly without editing code.
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-gray-200 dark:border-gray-700 pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==================== TAB 1: ADMIN CREDENTIALS & LOGIN ==================== */}
        {activeTab === 'credentials' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Picture (Live Camera + Upload from Device) */}
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiCamera className="text-primary-500" />
                      Administrator Profile Picture
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Personalize your administrator profile by snapping a live camera photo or browsing an image from your device. Your photo is securely saved to the database and persists across page refreshes and logouts.
                    </p>
                  </div>
                </div>

                {/* Status Message Banner (Success / Error) */}
                {avatarMessage && (
                  <div
                    role="alert"
                    className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm border ${
                      avatarMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {avatarMessage.type === 'success' ? (
                      <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : (
                      <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <span className="font-bold block text-sm">
                        {avatarMessage.type === 'success' ? 'Profile Picture Saved' : 'Profile Picture Update Failed'}
                      </span>
                      <p className="mt-0.5 leading-relaxed">{avatarMessage.text}</p>
                    </div>
                  </div>
                )}

                {/* Main Avatar Controls */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar Display */}
                  <div className="relative group shrink-0">
                    {avatarPreview || user?.avatar ? (
                      <img
                        src={avatarPreview || user?.avatar}
                        alt="Admin Profile"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-primary-500/80 shadow-lg"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-white font-black text-3xl flex items-center justify-center border-4 border-primary-200 dark:border-primary-900 shadow-lg">
                        {user?.firstName?.charAt(0) || 'A'}
                        {user?.lastName?.charAt(0) || ''}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        <FiRefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Actions & Buttons */}
                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {/* Browse Device Button */}
                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 shadow-sm"
                      >
                        <FiUpload size={15} />
                        <span>Upload from Device</span>
                      </Button>

                      {/* Live Camera Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleStartCamera}
                        disabled={isUploadingAvatar || isCameraOpen}
                        className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 border-primary-500 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40"
                      >
                        <FiCamera size={15} />
                        <span>Take Live Photo</span>
                      </Button>

                      {/* Remove Button */}
                      {(avatarPreview || user?.avatar) && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={isUploadingAvatar}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        >
                          <FiTrash2 size={14} />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      Accepts PNG, JPG, or WebP up to 5MB. You can also use your device's built-in webcam or phone camera to take an instant photo.
                    </p>
                  </div>
                </div>

                {/* Live Camera Modal / Inline Preview Area */}
                {isCameraOpen && (
                  <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <FiCamera className="text-primary-400" />
                        <span>Live Camera Snapshot</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleStopCamera}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        aria-label="Close camera"
                      >
                        <FiX size={18} />
                      </button>
                    </div>

                    {cameraError ? (
                      <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-200">
                        <p className="font-bold">Camera Access Error</p>
                        <p className="mt-1">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {/* Hidden canvas for image capture */}
                        <canvas ref={canvasRef} className="hidden" />

                        {capturedPhoto ? (
                          <div className="space-y-4 text-center">
                            <img
                              src={capturedPhoto}
                              alt="Captured snapshot"
                              className="w-48 h-48 sm:w-56 sm:h-56 rounded-full object-cover mx-auto border-4 border-emerald-500 shadow-xl"
                            />
                            <p className="text-xs text-slate-300">
                              Preview your captured snapshot above. Choose to save it or retake.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRetakePhoto}
                                disabled={isUploadingAvatar}
                                className="text-xs text-white border-slate-600 hover:bg-slate-800"
                              >
                                Retake Photo
                              </Button>
                              <Button
                                type="button"
                                onClick={handleSaveCapturedPhoto}
                                isLoading={isUploadingAvatar}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                              >
                                Save as Profile Picture
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 w-full max-w-sm mx-auto text-center">
                            <div className="relative rounded-2xl overflow-hidden aspect-square bg-black shadow-inner border border-slate-700">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover mirror scale-x-[-1]"
                              />
                              <div className="absolute inset-0 pointer-events-none rounded-full border-2 border-dashed border-white/40 m-6" />
                            </div>
                            <div className="flex items-center justify-center gap-3">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleStopCamera}
                                className="text-xs text-white border-slate-700 hover:bg-slate-800"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                onClick={handleCapturePhoto}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2"
                              >
                                <FiCamera size={16} />
                                <span>Capture Photo</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Profile & Login Email */}
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiMail className="text-primary-500" />
                      Login Email &amp; Account Details
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Changing your email address updates your administrator login username for all future logins.
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
                    <p className="font-semibold">{profileMessage.text}</p>
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
                      Save Profile &amp; Email
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Password Change Card */}
              <Card className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FiLock className="text-primary-500" />
                      Change Login Password
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Update your login password. You will use this new password for all subsequent logins.
                    </p>
                  </div>
                </div>

                {passwordMessage && (
                  <div
                    className={`mb-6 p-4 sm:p-5 rounded-xl border text-xs sm:text-sm ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {passwordMessage.type === 'success' ? (
                        <FiCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      ) : (
                        <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-bold leading-snug">{passwordMessage.text}</p>

                        {/* Evaluated Password Strength Feedback after update */}
                        {passwordMessage.type === 'success' && passwordMessage.strength && (
                          <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-700 dark:text-slate-300">
                                Evaluated Password Strength:
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${passwordMessage.strength.badgeBg}`}
                              >
                                {passwordMessage.strength.label}
                              </span>
                            </div>

                            {/* Strength bar */}
                            <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/40 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${passwordMessage.strength.progressBarClass}`}
                                style={{ width: `${passwordMessage.strength.percentage}%` }}
                              />
                            </div>

                            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                              {passwordMessage.strength.feedback}
                            </p>

                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 pt-1">
                              ✓ Configured for all future logins at <code>/admin/login</code>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        New Password (Min. 8 characters)
                      </label>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Any combination accepted
                      </span>
                    </div>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        placeholder="Enter your new password (minimum 8 characters)"
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
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                      Accepts any password as long as it has at least 8 characters. Password strength rating will be displayed upon save.
                    </p>
                  </div>

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

            {/* Sidebar Summary Card */}
            <div>
              <Card className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-850">
                <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                      {user?.firstName?.charAt(0) || 'A'}
                    </div>
                  )}
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
                    <span className="text-gray-500 dark:text-gray-400">Scope:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      Full Storefront Authority
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ==================== TAB 2: NOTICE & ANNOUNCEMENT BAR ==================== */}
        {activeTab === 'announcement' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiVolume2 className="text-amber-500" />
                    Top Announcement / Notice Bar (Public Header)
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Control the promotional banner that appears at the very top of all pages across desktop and mobile.
                  </p>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="mb-6 p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border text-xs">
                <span className="font-bold text-gray-500 dark:text-gray-400 block mb-2 uppercase tracking-wider text-[10px]">
                  Live Storefront Preview:
                </span>
                {storeSettings.announcement_enabled ? (
                  <div className="bg-white dark:bg-gray-950 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {storeSettings.announcement_badge}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                        {storeSettings.announcement_text}
                      </span>
                    </div>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      Link: {storeSettings.announcement_link}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Notice bar is currently disabled (hidden from public view).</p>
                )}
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border">
                  <input
                    type="checkbox"
                    id="announcement_enabled"
                    checked={storeSettings.announcement_enabled}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        announcement_enabled: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-primary-600 rounded cursor-pointer"
                  />
                  <label htmlFor="announcement_enabled" className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer">
                    Enable Notice Bar on Public Storefront
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Badge Title (Green Pulsing Dot)
                  </label>
                  <Input
                    value={storeSettings.announcement_badge}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, announcement_badge: e.target.value }))
                    }
                    placeholder="e.g. Kisii CBD Showroom Open Today"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Announcement / Delivery Message Text
                  </label>
                  <Input
                    value={storeSettings.announcement_text}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, announcement_text: e.target.value }))
                    }
                    placeholder="e.g. Same-Day Delivery across Kisii, Nyamira & South Nyanza"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Click Link / Route Destination
                  </label>
                  <Input
                    value={storeSettings.announcement_link}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, announcement_link: e.target.value }))
                    }
                    placeholder="e.g. /contact or /shop"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Announcement
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* ==================== TAB 3: HOMEPAGE HERO & HEADLINES ==================== */}
        {activeTab === 'hero' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiLayout className="text-primary-500" />
                    Homepage Landing Hero &amp; Headlines
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Customize the primary title, supporting description, and action buttons shown on the main landing screen.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Main Headline (Title)
                  </label>
                  <Input
                    value={storeSettings.hero_title}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, hero_title: e.target.value }))
                    }
                    placeholder="e.g. Tested & Warranted Laptops in Kisii CBD"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Hero Subtitle / Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={storeSettings.hero_subtitle}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, hero_subtitle: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Short description highlighting warranty and genuine stock"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Primary CTA Button Label
                    </label>
                    <Input
                      value={storeSettings.hero_cta_primary_text}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          hero_cta_primary_text: e.target.value,
                        }))
                      }
                      placeholder="e.g. Shop All Laptops"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Primary CTA Button Link
                    </label>
                    <Input
                      value={storeSettings.hero_cta_primary_link}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          hero_cta_primary_link: e.target.value,
                        }))
                      }
                      placeholder="e.g. /shop"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Secondary CTA Button Label
                    </label>
                    <Input
                      value={storeSettings.hero_cta_secondary_text}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          hero_cta_secondary_text: e.target.value,
                        }))
                      }
                      placeholder="e.g. Find My Match"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Secondary CTA Button Link
                    </label>
                    <Input
                      value={storeSettings.hero_cta_secondary_link}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          hero_cta_secondary_link: e.target.value,
                        }))
                      }
                      placeholder="e.g. /finder"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Hero Settings
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* ==================== TAB 4: SHOWROOM & CONTACT INFO ==================== */}
        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMapPin className="text-emerald-500" />
                    Physical Showroom &amp; Customer Contact Channels
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Updates physical showroom location, phone lines, WhatsApp link, and business hours across header, footer, and contact pages.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Showroom Address
                    </label>
                    <Input
                      value={storeSettings.showroom_address}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          showroom_address: e.target.value,
                        }))
                      }
                      placeholder="e.g. Mocha Place, 2nd Floor, Hospital Road, Kisii Town"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      City / Region
                    </label>
                    <Input
                      value={storeSettings.showroom_city}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, showroom_city: e.target.value }))
                      }
                      placeholder="e.g. Kisii CBD, Kenya"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Primary Phone Hotline
                    </label>
                    <Input
                      value={storeSettings.phone_primary}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, phone_primary: e.target.value }))
                      }
                      placeholder="e.g. +254 104 504 692"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Secondary Phone / Mobile
                    </label>
                    <Input
                      value={storeSettings.phone_secondary}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          phone_secondary: e.target.value,
                        }))
                      }
                      placeholder="e.g. +254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      WhatsApp Number (Format: +254...)
                    </label>
                    <Input
                      value={storeSettings.whatsapp_number}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          whatsapp_number: e.target.value,
                        }))
                      }
                      placeholder="e.g. +254104504692"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Official Support Email
                  </label>
                  <Input
                    type="email"
                    value={storeSettings.support_email}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, support_email: e.target.value }))
                    }
                    placeholder="e.g. support@apexbyte.co.ke"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Monday - Friday Hours
                    </label>
                    <Input
                      value={storeSettings.hours_weekdays}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, hours_weekdays: e.target.value }))
                      }
                      placeholder="e.g. Mon - Fri: 8:00 AM - 6:30 PM"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Saturday Hours
                    </label>
                    <Input
                      value={storeSettings.hours_saturday}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, hours_saturday: e.target.value }))
                      }
                      placeholder="e.g. Sat: 8:30 AM - 6:00 PM"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Sunday Hours
                    </label>
                    <Input
                      value={storeSettings.hours_sunday}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, hours_sunday: e.target.value }))
                      }
                      placeholder="e.g. Sun: 10:00 AM - 4:00 PM"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Contact Info
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* ==================== TAB 5: SHIPPING, VAT & PRICING ==================== */}
        {activeTab === 'commerce' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiTruck className="text-sky-500" />
                    E-Commerce Rules: Shipping Fees, VAT &amp; Currency
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Control the shipping delivery calculation, free shipping trigger threshold, and tax computation used in the Shopping Cart and Checkout.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Standard Shipping / Courier Fee (KSh)
                    </label>
                    <Input
                      type="number"
                      value={storeSettings.shipping_fee}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          shipping_fee: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="e.g. 500"
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Applied when the customer order total is below the free delivery threshold.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Free Shipping Minimum Order (KSh)
                    </label>
                    <Input
                      type="number"
                      value={storeSettings.free_shipping_threshold}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          free_shipping_threshold: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="e.g. 50000"
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Orders equal or above this subtotal automatically receive free delivery.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      VAT Tax Rate (%)
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      value={storeSettings.tax_rate_percent}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          tax_rate_percent: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="e.g. 8"
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Percentage applied to compute VAT tax (e.g. 8 for 8%).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Currency Code
                    </label>
                    <Input
                      value={storeSettings.currency_code}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({ ...prev, currency_code: e.target.value }))
                      }
                      placeholder="e.g. KES"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                      Currency Display Symbol
                    </label>
                    <Input
                      value={storeSettings.currency_symbol}
                      onChange={(e) =>
                        setStoreSettings((prev) => ({
                          ...prev,
                          currency_symbol: e.target.value,
                        }))
                      }
                      placeholder="e.g. KSh"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Commerce Rules
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* ==================== TAB 6: TRUST BADGES & GUARANTEES ==================== */}
        {activeTab === 'badges' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiAward className="text-purple-500" />
                    Customer Trust Badges &amp; Value Guarantees
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Customize the 4 customer assurance guarantee points displayed on the footer ribbon, home page, and product detail views.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    1. Warranty Guarantee Text
                  </label>
                  <Input
                    value={storeSettings.badge_warranty}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, badge_warranty: e.target.value }))
                    }
                    placeholder="e.g. 1-Year Local Warranty on all machines"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    2. Delivery Promise Text
                  </label>
                  <Input
                    value={storeSettings.badge_delivery}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, badge_delivery: e.target.value }))
                    }
                    placeholder="e.g. Same-Day Delivery in Kisii & South Nyanza"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    3. Return &amp; Swap Policy Text
                  </label>
                  <Input
                    value={storeSettings.badge_returns}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, badge_returns: e.target.value }))
                    }
                    placeholder="e.g. 7-Day Easy Swap & Return Guarantee"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    4. Showroom Physical Pickup Text
                  </label>
                  <Input
                    value={storeSettings.badge_pickup}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, badge_pickup: e.target.value }))
                    }
                    placeholder="e.g. Showroom Pickup at Mocha Place, Hospital Road"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Trust Badges
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {/* ==================== TAB 7: SOCIAL CHANNELS ==================== */}
        {activeTab === 'social' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiShare2 className="text-pink-500" />
                    Official Social Media Channels
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Control the social media URLs linked in the footer and contact sections.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Facebook Page URL
                  </label>
                  <Input
                    type="url"
                    value={storeSettings.social_facebook}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, social_facebook: e.target.value }))
                    }
                    placeholder="https://facebook.com/apexbytelaptops"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    X (Twitter) Profile URL
                  </label>
                  <Input
                    type="url"
                    value={storeSettings.social_twitter}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, social_twitter: e.target.value }))
                    }
                    placeholder="https://x.com/apexbytelaptops"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Instagram Profile URL
                  </label>
                  <Input
                    type="url"
                    value={storeSettings.social_instagram}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, social_instagram: e.target.value }))
                    }
                    placeholder="https://instagram.com/apexbytelaptops"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    TikTok Profile URL
                  </label>
                  <Input
                    type="url"
                    value={storeSettings.social_tiktok}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, social_tiktok: e.target.value }))
                    }
                    placeholder="https://tiktok.com/@apexbytelaptops"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isSavingSettings}
                    leftIcon={<FiSave />}
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-md"
                  >
                    Save &amp; Publish Social Links
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default AdminSettings;
