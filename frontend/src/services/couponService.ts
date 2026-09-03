import api from './api';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponRequest {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  code: string;
  type: string;
  value: number;
  discountAmount: number;
  description: string;
}

const couponService = {
  validateCoupon: async (data: ValidateCouponRequest) => {
    const response = await api.post<{ data: ValidateCouponResponse }>(
      '/coupons/validate',
      data
    );
    return response.data.data;
  },

  getActiveCoupons: async () => {
    const response = await api.get<{ data: Coupon[] }>('/coupons/active');
    return response.data.data;
  },

  // Admin endpoints
  getCoupons: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) => {
    const response = await api.get<{
      data: Coupon[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/coupons', { params });
    return response.data;
  },

  getCoupon: async (id: string) => {
    const response = await api.get<{ data: Coupon }>(`/coupons/${id}`);
    return response.data.data;
  },

  createCoupon: async (data: Partial<Coupon>) => {
    const response = await api.post<{ data: Coupon }>('/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>) => {
    const response = await api.put<{ data: Coupon }>(`/coupons/${id}`, data);
    return response.data.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await api.delete(`/coupons/${id}`);
    return response.data;
  },
};

export default couponService;
