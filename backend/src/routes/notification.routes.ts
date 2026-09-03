import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  sendBulkNotification,
  getNotificationStats,
  getAllNotifications,
  getNotificationAnalytics,
} from '../controllers/notification.controller';

const router = Router();

// User routes
router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.get('/stats', authenticate, getNotificationStats);

router.put(
  '/:id/read',
  authenticate,
  [param('id').isUUID().withMessage('Invalid notification ID')],
  validateRequest,
  markAsRead
);

router.put('/read-all', authenticate, markAllAsRead);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('Invalid notification ID')],
  validateRequest,
  deleteNotification
);

router.delete('/delete-all', authenticate, deleteAllNotifications);

// Admin routes
router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  getAllNotifications
);

router.get(
  '/admin/analytics',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  getNotificationAnalytics
);

router.post(
  '/admin/create',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('userId').isUUID().withMessage('Invalid user ID'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').isIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ORDER', 'PROMOTION']).withMessage('Invalid notification type'),
    body('link').optional().isString(),
  ],
  validateRequest,
  createNotification
);

router.post(
  '/admin/bulk',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    body('userIds').isArray({ min: 1 }).withMessage('User IDs array is required'),
    body('userIds.*').isUUID().withMessage('Invalid user ID in array'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').optional().isIn(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ORDER', 'PROMOTION']),
    body('link').optional().isString(),
  ],
  validateRequest,
  sendBulkNotification
);

export default router;
