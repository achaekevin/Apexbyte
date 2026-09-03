import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  validateCoupon,
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons,
} from '../controllers/coupon.controller';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// Public routes
router.get('/active', getActiveCoupons);

// Customer routes
router.post(
  '/validate',
  authenticate,
  [
    body('code').notEmpty().withMessage('Coupon code is required'),
    body('subtotal').isFloat({ min: 0 }).withMessage('Invalid subtotal'),
  ],
  validateRequest,
  validateCoupon
);

// Admin routes
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getCoupons);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid coupon ID')],
  validateRequest,
  getCoupon
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('code').optional().isString().withMessage('Invalid coupon code'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Invalid coupon type'),
    body('value').isFloat({ min: 0 }).withMessage('Invalid value'),
    body('minPurchase').optional().isFloat({ min: 0 }).withMessage('Invalid minimum purchase'),
    body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Invalid maximum discount'),
    body('usageLimit').optional().isInt({ min: 1 }).withMessage('Invalid usage limit'),
    body('perUserLimit').optional().isInt({ min: 1 }).withMessage('Invalid per user limit'),
    body('startDate').isISO8601().withMessage('Invalid start date'),
    body('endDate').isISO8601().withMessage('Invalid end date'),
  ],
  validateRequest,
  createCoupon
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID().withMessage('Invalid coupon ID'),
    body('description').optional().isString().withMessage('Invalid description'),
    body('type').optional().isIn(['PERCENTAGE', 'FIXED_AMOUNT']).withMessage('Invalid coupon type'),
    body('value').optional().isFloat({ min: 0 }).withMessage('Invalid value'),
    body('minPurchase').optional().isFloat({ min: 0 }).withMessage('Invalid minimum purchase'),
    body('maxDiscount').optional().isFloat({ min: 0 }).withMessage('Invalid maximum discount'),
    body('usageLimit').optional().isInt({ min: 1 }).withMessage('Invalid usage limit'),
    body('perUserLimit').optional().isInt({ min: 1 }).withMessage('Invalid per user limit'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('isActive').optional().isBoolean().withMessage('Invalid isActive value'),
  ],
  validateRequest,
  updateCoupon
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid coupon ID')],
  validateRequest,
  deleteCoupon
);

export default router;
