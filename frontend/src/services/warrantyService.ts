import api from './api';

export interface Warranty {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  productId: string;
  serialNumber?: string;
  warrantyPeriodMonths: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'VOIDED';
  terms?: string;
  product?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    images?: string[];
  };
  order?: {
    orderNumber: string;
    createdAt: string;
  };
  claims?: WarrantyClaim[];
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  warrantyId: string;
  userId: string;
  issueDescription: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REPAIR_IN_PROGRESS' | 'REPLACEMENT_ARRANGED' | 'REJECTED' | 'RESOLVED';
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  warranty?: Warranty;
}

const warrantyService = {
  getMyWarranties: async () => {
    const response = await api.get<{ success: boolean; data: Warranty[] }>('/warranties');
    return response.data;
  },

  getWarrantyById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Warranty }>(`/warranties/${id}`);
    return response.data;
  },

  submitClaim: async (data: { warrantyId: string; issueDescription: string }) => {
    const response = await api.post<{ success: boolean; data: WarrantyClaim; message: string }>(
      '/warranties/claims',
      data
    );
    return response.data;
  },

  getMyClaims: async () => {
    const response = await api.get<{ success: boolean; data: WarrantyClaim[] }>('/warranties/claims/my-claims');
    return response.data;
  },

  // Admin
  getAllWarranties: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const response = await api.get('/warranties/admin/all', { params });
    return response.data;
  },

  updateSerialNumber: async (id: string, serialNumber: string) => {
    const response = await api.put(`/warranties/admin/${id}/serial`, { serialNumber });
    return response.data;
  },

  getAllClaims: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/warranties/admin/claims', { params });
    return response.data;
  },

  updateClaimStatus: async (id: string, data: { status: string; resolutionNotes?: string }) => {
    const response = await api.put(`/warranties/admin/claims/${id}`, data);
    return response.data;
  },
};

export default warrantyService;
