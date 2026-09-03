import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Analytics
router.get('/analytics/overview', (req, res) => res.json({ success: true, data: {} }));
router.get('/analytics/sales', (req, res) => res.json({ success: true, data: [] }));
router.get('/analytics/customers', (req, res) => res.json({ success: true, data: {} }));
router.get('/analytics/products', (req, res) => res.json({ success: true, data: {} }));

// Reports
router.get('/reports/sales', (req, res) => res.json({ success: true, data: [] }));
router.get('/reports/inventory', (req, res) => res.json({ success: true, data: [] }));
router.get('/reports/customers', (req, res) => res.json({ success: true, data: [] }));

export default router;
