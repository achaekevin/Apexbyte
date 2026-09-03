import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getComments,
  createComment,
  approveComment,
  deleteComment,
} from '../controllers/blog.controller';

const router = Router();

// Public routes
router.get('/posts', getPosts);
router.get('/posts/:slug', getPost);
router.get('/categories', getCategories);

// Authenticated routes - Comments
router.post(
  '/comments',
  authenticate,
  [
    body('postId').isUUID().withMessage('Invalid post ID'),
    body('content').notEmpty().withMessage('Comment content is required'),
  ],
  validateRequest,
  createComment
);

// Admin routes - Posts
router.post(
  '/posts',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.single('featuredImage'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('excerpt').optional().isString(),
    body('categoryId').isUUID().withMessage('Invalid category ID'),
    body('tags').optional().isString(),
    body('metaTitle').optional().isString(),
    body('metaDescription').optional().isString(),
    body('isFeatured').optional().isString(),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  ],
  validateRequest,
  createPost
);

router.put(
  '/posts/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.single('featuredImage'),
  [
    param('id').isUUID().withMessage('Invalid post ID'),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('excerpt').optional().isString(),
    body('categoryId').optional().isUUID(),
    body('tags').optional().isString(),
    body('metaTitle').optional().isString(),
    body('metaDescription').optional().isString(),
    body('isFeatured').optional().isString(),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  ],
  validateRequest,
  updatePost
);

router.delete(
  '/posts/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid post ID')],
  validateRequest,
  deletePost
);

// Admin routes - Categories
router.post(
  '/categories',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('name').notEmpty().withMessage('Category name is required'),
    body('description').optional().isString(),
  ],
  validateRequest,
  createCategory
);

router.put(
  '/categories/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').optional().isString(),
    body('description').optional().isString(),
  ],
  validateRequest,
  updateCategory
);

router.delete(
  '/categories/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid category ID')],
  validateRequest,
  deleteCategory
);

// Admin routes - Comments
router.get(
  '/comments',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  getComments
);

router.put(
  '/comments/:id/approve',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid comment ID')],
  validateRequest,
  approveComment
);

router.delete(
  '/comments/:id',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [param('id').isUUID().withMessage('Invalid comment ID')],
  validateRequest,
  deleteComment
);

export default router;
