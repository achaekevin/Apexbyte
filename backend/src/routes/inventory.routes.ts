import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getInventoryLogs,
  getLowStockProducts,
  getOutOfStockProducts,
  updateStock,
  bulkUpdateStock,
  getInventoryStats,
  getStockHistory,
  createStockAlert,
  getStockAlerts,
  updateStockAlert,
  deleteStockAlert,
} from '../controllers/inventory.controller';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Inventory logs
router.get('/logs', getInventoryLogs);

// Stock management
router.get('/low-stock', getLowStockProducts);
router.get('/out-of-stock', getOutOfStockProducts);
router.get('/stats', getInventoryStats);

router.put(
  '/products/:id/stock',
  [
    param('id').isUUID().withMessage('Invalid product ID'),
    body('quantity').isInt().withMessage('Quantity must be an integer'),
    body('reason').optional().isString().withMessage('Invalid reason'),
    body('type').optional().isIn(['SALE', 'RETURN', 'RESTOCK', 'ADJUSTMENT', 'DAMAGED']).withMessage('Invalid type'),
  ],
  validateRequest,
  updateStock
);

router.post(
  '/bulk-update',
  [
    body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
    body('updates.*.productId').isUUID().withMessage('Invalid product ID'),
    body('updates.*.quantity').isInt().withMessage('Quantity must be an integer'),
    body('updates.*.reason').optional().isString().withMessage('Invalid reason'),
  ],
  validateRequest,
  bulkUpdateStock
);

router.get(
  '/products/:id/history',
  [param('id').isUUID().withMessage('Invalid product ID')],
  validateRequest,
  getStockHistory
);

// Stock alerts
router.get('/alerts', getStockAlerts);

router.post(
  '/alerts',
  [
    body('productId').isUUID().withMessage('Invalid product ID'),
    body('threshold').isInt({ min: 0 }).withMessage('Invalid threshold'),
    body('enabled').optional().isBoolean().withMessage('Invalid enabled value'),
  ],
  validateRequest,
  createStockAlert
);

router.put(
  '/alerts/:id',
  [
    param('id').isUUID().withMessage('Invalid alert ID'),
    body('threshold').optional().isInt({ min: 0 }).withMessage('Invalid threshold'),
    body('enabled').optional().isBoolean().withMessage('Invalid enabled value'),
  ],
  validateRequest,
  updateStockAlert
);

router.delete(
  '/alerts/:id',
  [param('id').isUUID().withMessage('Invalid alert ID')],
  validateRequest,
  deleteStockAlert
);

export default router;
