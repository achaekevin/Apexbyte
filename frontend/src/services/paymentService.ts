import api from './api';

export interface MpesaInitiateResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
  paymentId: string;
}

export interface MpesaStatusResponse {
  checkoutRequestId: string;
  merchantRequestId: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  isPaid: boolean;
  resultCode?: string;
  resultDesc?: string;
  mpesaReceiptNumber?: string;
}

const paymentService = {
  createPaymentIntent: async (data: { amount: number; currency: string; orderId?: string }) => {
    const response = await api.post<{ data: { clientSecret: string; paymentIntentId: string } }>(
      '/payments/stripe/create-intent',
      data
    );
    return response.data.data;
  },

  initiateMpesa: async (orderId: string, phoneNumber: string) => {
    const response = await api.post<{ success: boolean; data: MpesaInitiateResponse; message: string }>(
      '/payments/mpesa/initiate',
      { orderId, phoneNumber }
    );
    return response.data;
  },

  queryMpesaStatus: async (checkoutRequestId: string) => {
    const response = await api.get<{ success: boolean; data: MpesaStatusResponse }>(
      `/payments/mpesa/query/${checkoutRequestId}`
    );
    return response.data;
  },

  processRefund: async (paymentIntentId: string, amount?: number) => {
    const response = await api.post('/payments/refund', {
      paymentIntentId,
      amount,
    });
    return response.data;
  },

  getAllPayments: async (params?: { page?: number; limit?: number; status?: string; method?: string; search?: string }) => {
    const response = await api.get('/payments/admin/all', { params });
    return response.data;
  },

  reconcilePayment: async (paymentId: string) => {
    const response = await api.post(`/payments/admin/reconcile/${paymentId}`);
    return response.data;
  },
};

export default paymentService;
