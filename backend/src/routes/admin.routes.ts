import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  resetAdminPassword,
  deleteAdmin,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

// Administrator Team Management (Admin-only creation & management)
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.put('/admins/:id/password', resetAdminPassword);
router.delete('/admins/:id', deleteAdmin);

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
