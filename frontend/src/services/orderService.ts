import api from './api';

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddressId?: string;
  billingAddressId?: string;
  paymentMethod: string;
  couponCode?: string;
  notes?: string;
}

export const orderService = {
  createOrder: (data: CreateOrderData) => api.post('/orders', data),
  
  getOrders: (params?: { page?: number; limit?: number; status?: string } | number, limit: number = 10): Promise<any> => {
    if (typeof params === 'object' && params !== null) {
      return api.get<any, any>('/orders', { params });
    }
    return api.get<any, any>('/orders', { params: { page: params || 1, limit } });
  },
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
  
  trackOrder: (orderNumber: string) =>
    api.get(`/orders/track/${orderNumber}`),
};

export default orderService;
