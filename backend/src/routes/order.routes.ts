import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import {
  createOrder,
  getOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller';

const router = Router();

// Customer routes
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.post('/', optionalAuth, createOrder);
router.put('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllOrders);
router.put('/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateOrderStatus);

export default router;
