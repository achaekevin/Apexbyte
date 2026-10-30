import api from './api';

export interface ReturnItem {
  id: string;
  orderItemId: string;
  quantity: number;
  reason?: string;
  condition?: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  orderId: string;
  userId: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED' | 'INSPECTED' | 'REFUNDED' | 'CLOSED';
  refundAmount?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  order?: {
    orderNumber: string;
    total: number;
    createdAt: string;
    items?: Array<{
      id: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
  };
  items?: ReturnItem[];
}

const returnService = {
  submitReturn: async (data: {
    orderId: string;
    reason: string;
    description: string;
    items?: Array<{ orderItemId: string; quantity: number; reason?: string }>;
  }) => {
    const response = await api.post<{ success: boolean; data: ReturnRequest; message: string }>(
      '/returns',
      data
    );
    return response.data;
  },

  getMyReturns: async () => {
    const response = await api.get<{ success: boolean; data: ReturnRequest[] }>('/returns/my-returns');
    return response.data;
  },

  getReturnById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: ReturnRequest }>(`/returns/${id}`);
    return response.data;
  },

  // Admin
  getAllReturns: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/returns/admin/all', { params });
    return response.data;
  },

  updateStatus: async (id: string, data: { status: string; adminNotes?: string }) => {
    const response = await api.put(`/returns/admin/${id}/status`, data);
    return response.data;
  },

  processRefund: async (id: string, data?: { refundAmount?: number; restockItems?: boolean; notes?: string }) => {
    const response = await api.post(`/returns/admin/${id}/refund`, data || {});
    return response.data;
  },
};

export default returnService;
