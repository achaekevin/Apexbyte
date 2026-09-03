import api from './api';

const paymentService = {
  createPaymentIntent: async (data: { amount: number; currency: string }) => {
    const response = await api.post<{ data: { clientSecret: string } }>(
      '/payments/stripe/create-intent',
      data
    );
    return response.data.data;
  },

  processRefund: async (paymentIntentId: string, amount?: number) => {
    const response = await api.post('/payments/refund', {
      paymentIntentId,
      amount,
    });
    return response.data;
  },
};

export default paymentService;
