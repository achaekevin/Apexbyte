import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import { reviewLimiter } from '../middleware/rateLimiter';
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

router.get('/', getAllReviews);
router.get('/featured', getFeaturedReviews);
router.get('/product/:productId', optionalAuth, getProductReviews);
router.post('/', reviewLimiter, authenticate, uploadMultiple, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/helpful', authenticate, markReviewHelpful);
router.post('/:id/images', authenticate, uploadMultiple, uploadReviewImages);

// Admin routes
router.put('/:id/approve', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), approveReview);
router.post('/:id/reply', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), replyToReview);

export default router;
