import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordValidation = [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const verifyEmailValidation = [
  body('token').trim().notEmpty().withMessage('Verification token is required'),
];

const resendVerificationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

// Routes - All authentication endpoints are protected by the shared 5-attempt/15-minute rate limiter
router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/refresh-token', authLimiter, refreshToken);
router.post('/logout', authenticate, logout);
router.post('/verify-email', authLimiter, validate(verifyEmailValidation), verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationValidation), resendVerification);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordValidation), resetPassword);
router.get('/me', authenticate, getCurrentUser);
router.put('/change-password', authenticate, authLimiter, validate(changePasswordValidation), changePassword);

export default router;
