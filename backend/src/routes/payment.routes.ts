import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
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

const mpesaInitiateValidation = [
  body('phoneNumber')
    .matches(/^254\d{9}$/)
    .withMessage('Invalid Kenyan phone number format. Use 254XXXXXXXXX'),
];

const paypalCaptureValidation = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('paypalOrderId').trim().notEmpty().withMessage('PayPal Order ID is required'),
];

const refundValidation = [
  body('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('reason').optional().trim(),
];

const paymentMethodValidation = [
  body('type').optional().isIn(['CARD', 'BANK_ACCOUNT']).withMessage('Invalid payment method type'),
  body('provider').optional().isIn(['STRIPE', 'PAYPAL']).withMessage('Invalid payment provider'),
];

// Stripe
router.post('/stripe/create-intent', authenticate, createStripePaymentIntent);
router.post('/stripe/webhook', handleStripeWebhook);

// PayPal
router.post('/paypal/create-order', authenticate, createPayPalOrder);
router.post('/paypal/capture', authenticate, validate(paypalCaptureValidation), capturePayPalPayment);
router.post('/paypal/webhook', handlePayPalWebhook);

// MPesa
router.post('/mpesa/initiate', authenticate, validate(mpesaInitiateValidation), initiateMpesaPayment);
router.post('/mpesa/callback', handleMpesaCallback);

// Refunds (Admin)
router.post(
  '/refund',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate(refundValidation),
  processRefund
);

// Payment Methods
router.get('/methods', authenticate, getPaymentMethods);
router.post('/methods', authenticate, validate(paymentMethodValidation), addPaymentMethod);
router.delete('/methods/:id', authenticate, validate([param('id').notEmpty().withMessage('ID is required')]), deletePaymentMethod);

export default router;
