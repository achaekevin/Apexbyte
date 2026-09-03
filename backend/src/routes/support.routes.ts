import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/tickets', authenticate, (req, res) => res.json({ success: true }));
router.get('/tickets', authenticate, (req, res) => res.json({ success: true, data: [] }));
router.get('/tickets/:id', authenticate, (req, res) => res.json({ success: true, data: {} }));
router.post('/tickets/:id/messages', authenticate, (req, res) => res.json({ success: true }));

// Admin routes
router.get('/admin/tickets', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => res.json({ success: true, data: [] }));
router.put('/admin/tickets/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => res.json({ success: true }));

export default router;
