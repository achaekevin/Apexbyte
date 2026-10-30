import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  submitReturnRequest,
  getMyReturns,
  getReturnById,
  getAllReturnRequests,
  updateReturnStatus,
  processReturnRefund,
} from '../controllers/return.controller';

const router = Router();

// Customer routes
router.post(
  '/',
  authenticate,
  validate([
    body('orderId').notEmpty().withMessage('orderId is required'),
    body('reason').notEmpty().withMessage('Reason is required'),
    body('description')
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters'),
  ]),
  submitReturnRequest
);
router.get('/my-returns', authenticate, getMyReturns);
router.get('/:id', authenticate, getReturnById);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllReturnRequests);
router.put(
  '/admin/:id/status',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Return ID is required'),
    body('status')
      .isIn(['PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'INSPECTED', 'REFUNDED', 'CLOSED'])
      .withMessage('Invalid return status'),
  ]),
  updateReturnStatus
);
router.post(
  '/admin/:id/refund',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate([param('id').notEmpty().withMessage('Return ID is required')]),
  processReturnRefund
);

export default router;
