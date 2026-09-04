import { Router } from 'express';
import { optionalAuth, authenticate, authorize } from '../middleware/auth';
import { uploadMultiple } from '../middleware/upload';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  getFiltersData,
} from '../controllers/product.controller';
import { getProductReviews } from '../controllers/review.controller';

const router = Router();

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/filters', getFiltersData);
router.get('/:id', optionalAuth, getProduct);
router.get('/:id/related', getRelatedProducts);
router.get('/:productId/reviews', optionalAuth, getProductReviews);
router.get('/slug/:slug', optionalAuth, getProductBySlug);

// Admin routes
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteProduct);
router.post('/:id/images', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), uploadMultiple, uploadProductImages);

export default router;
