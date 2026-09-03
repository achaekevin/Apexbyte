import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDashboardStats,
  getSalesAnalytics,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getOrderAnalytics,
  getReviewAnalytics,
  getExportData,
} from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/products', getProductAnalytics);
router.get('/orders', getOrderAnalytics);
router.get('/reviews', getReviewAnalytics);
router.get('/export', getExportData);

export default router;
