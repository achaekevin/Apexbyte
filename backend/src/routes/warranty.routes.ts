import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getMyWarranties,
  getWarrantyById,
  submitWarrantyClaim,
  getMyClaims,
  getAllWarranties,
  updateSerialNumber,
  getAllWarrantyClaims,
  updateWarrantyClaimStatus,
} from '../controllers/warranty.controller';

const router = Router();

// Customer routes
router.get('/', authenticate, getMyWarranties);
router.get('/claims/my-claims', authenticate, getMyClaims);
router.get('/:id', authenticate, getWarrantyById);
router.post(
  '/claims',
  authenticate,
  validate([
    body('warrantyId').notEmpty().withMessage('warrantyId is required'),
    body('issueDescription')
      .isLength({ min: 10 })
      .withMessage('Issue description must be at least 10 characters'),
  ]),
  submitWarrantyClaim
);

// Admin routes
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllWarranties);
router.put(
  '/admin/:id/serial',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Warranty ID is required'),
    body('serialNumber').notEmpty().withMessage('serialNumber is required'),
  ]),
  updateSerialNumber
);
router.get('/admin/claims', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), getAllWarrantyClaims);
router.put(
  '/admin/claims/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate([
    param('id').notEmpty().withMessage('Claim ID is required'),
    body('status')
      .isIn([
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REPAIR_IN_PROGRESS',
        'REPLACEMENT_ARRANGED',
        'REJECTED',
        'RESOLVED',
      ])
      .withMessage('Invalid claim status'),
  ]),
  updateWarrantyClaimStatus
);

export default router;
