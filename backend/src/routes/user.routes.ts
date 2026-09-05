import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/user.controller';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validation rules
const profileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
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

// Profile endpoints
router.get('/profile', getProfile);
router.put('/profile', validate(profileValidation), updateProfile);

// Address endpoints with strict IDOR protections
router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressValidation), createAddress);
router.put('/addresses/:id', validate([...addressIdValidation, ...addressValidation]), updateAddress);
router.delete('/addresses/:id', validate(addressIdValidation), deleteAddress);

export default router;
