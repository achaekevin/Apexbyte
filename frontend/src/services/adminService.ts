import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface UpdateAdminData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
}

export const adminService = {
  getAdmins: async (): Promise<{ success: boolean; data: AdminUser[] }> => {
    return api.get('/admin/admins');
  },

  createAdmin: async (data: CreateAdminData): Promise<{ success: boolean; message: string; data: AdminUser }> => {
    return api.post('/admin/admins', data);
  },

  updateAdmin: async (id: string, data: UpdateAdminData): Promise<{ success: boolean; message: string; data: AdminUser }> => {
    return api.put(`/admin/admins/${id}`, data);
  },

  resetAdminPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return api.put(`/admin/admins/${id}/password`, { newPassword });
  },

  deleteAdmin: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(`/admin/admins/${id}`);
  },
};

export default adminService;
