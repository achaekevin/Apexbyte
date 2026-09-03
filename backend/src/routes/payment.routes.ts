import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createStripePaymentIntent,
  handleStripeWebhook,
  createPayPalOrder,
  capturePayPalPayment,
  handlePayPalWebhook,
  initiateMpesaPayment,
  handleMpesaCallback,
  processRefund,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} from '../controllers/payment.controller';

const router = Router();

// Stripe
router.post('/stripe/create-intent', authenticate, createStripePaymentIntent);
router.post('/stripe/webhook', handleStripeWebhook);

// PayPal
router.post('/paypal/create-order', authenticate, createPayPalOrder);
router.post('/paypal/capture', authenticate, capturePayPalPayment);
router.post('/paypal/webhook', handlePayPalWebhook);

// MPesa
router.post('/mpesa/initiate', authenticate, initiateMpesaPayment);
router.post('/mpesa/callback', handleMpesaCallback);

// Refunds (Admin)
router.post('/refund', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), processRefund);

// Payment Methods
router.get('/methods', authenticate, getPaymentMethods);
router.post('/methods', authenticate, addPaymentMethod);
router.delete('/methods/:id', authenticate, deletePaymentMethod);

export default router;
