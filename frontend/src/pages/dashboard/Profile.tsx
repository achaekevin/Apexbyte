import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/profile', data),
    onSuccess: (res: any) => {
      const updated = res?.data || res;
      updateUser({
        firstName: updated.firstName || profileData.firstName,
        lastName: updated.lastName || profileData.lastName,
        email: updated.email || profileData.email,
        phone: updated.phone || profileData.phone,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile details updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: any) => api.put('/users/password', data),
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update password');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <>
      <Helmet>
        <title>My Profile - Premium Laptop Store</title>
      </Helmet>

      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Profile Information */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Profile Information</h2>
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold mb-1.5 text-gray-700 dark:text-gray-300">Phone</label>
                  <Input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-6"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? 'Updating...'
                  : 'Update Profile'}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    At least 8 characters with uppercase, lowercase, number, and
                    special character
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="mt-6"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending
                  ? 'Updating...'
                  : 'Change Password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;
