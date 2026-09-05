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
