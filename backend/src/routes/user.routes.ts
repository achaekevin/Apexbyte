import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAllUsers,
} from '../controllers/user.controller';
import { changePassword } from '../controllers/auth.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validation rules
const profileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const addressValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State/County is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
];

const addressIdValidation = [
  param('id').trim().notEmpty().withMessage('Address ID is required'),
];

// Admin endpoints
router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), getAllUsers);

// Profile endpoints
router.get('/profile', getProfile);
router.put('/profile', validate(profileValidation), updateProfile);
router.put('/password', validate(changePasswordValidation), changePassword);

// Address endpoints with strict IDOR protections
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressValidation), createAddress);
router.put('/addresses/:id', validate([...addressIdValidation, ...addressValidation]), updateAddress);
router.delete('/addresses/:id', validate(addressIdValidation), deleteAddress);

export default router;
