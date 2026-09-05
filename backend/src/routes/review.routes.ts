import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { reviewLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validation';
import {
  getProductReviews,
  getAllReviews,
  getFeaturedReviews,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  uploadReviewImages,
  approveReview,
  replyToReview,
} from '../controllers/review.controller';

const router = Router();

const createReviewValidation = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title').optional().trim(),
  body('comment').optional().trim(),
];

const updateReviewValidation = [
  param('id').trim().notEmpty().withMessage('Review ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('title').optional().trim(),
  body('comment').optional().trim(),
];

const idParamValidation = [
  param('id').trim().notEmpty().withMessage('Review ID is required'),
];

router.get('/', getAllReviews);
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', optionalAuth, getProductReviews);
router.post('/', reviewLimiter, authenticate, uploadMultiple, validate(createReviewValidation), createReview);
router.put('/:id', authenticate, validate(updateReviewValidation), updateReview);
router.delete('/:id', authenticate, validate(idParamValidation), deleteReview);
router.post('/:id/helpful', authenticate, validate(idParamValidation), markReviewHelpful);
router.post('/:id/images', authenticate, uploadMultiple, validate(idParamValidation), uploadReviewImages);

// Admin routes
router.put('/:id/approve', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(idParamValidation), approveReview);
router.post(
  '/:id/reply',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  validate([...idParamValidation, body('reply').trim().notEmpty().withMessage('Reply content is required')]),
  replyToReview
);

export default router;
