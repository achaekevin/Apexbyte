import api from './api';

export interface CustomerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface CustomerListResponse {
  success: boolean;
  data: CustomerUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userService = {
  getProfile: async () => {
    const res: any = await api.get('/users/profile');
    return res.data || res;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
  }) => {
    const res: any = await api.put('/users/profile', data);
    return res.data || res;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res: any = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data || res;
  },

  updateAvatarBase64: async (avatarBase64: string) => {
    const res: any = await api.post('/users/avatar', { avatar: avatarBase64 });
    return res.data || res;
  },

  removeAvatar: async () => {
    const res: any = await api.delete('/users/avatar');
    return res.data || res;
  },

  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<CustomerListResponse> => {
    const res: any = await api.get('/users', { params });
    return res;
  },
};

export default userService;
