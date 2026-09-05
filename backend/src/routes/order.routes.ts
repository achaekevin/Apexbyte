import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { createOrderLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';

const router = Router();

const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('paymentMethod')
    .isIn(['STRIPE', 'PAYPAL', 'MPESA', 'CASH_ON_DELIVERY', 'BANK_TRANSFER'])
    .withMessage('Invalid payment method'),
];

const updateStatusValidation = [
  param('id').trim().notEmpty().withMessage('Order ID is required'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Invalid order status'),
];

// Customer routes
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', createOrderLimiter, optionalAuth, validate(createOrderValidation), createOrder);
router.put('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllOrders);
router.put(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate(updateStatusValidation),
  updateOrderStatus
);

export default router;
