import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => res.json({ success: true, data: [] }));
router.get('/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => res.json({ success: true }));
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => res.json({ success: true }));
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => res.json({ success: true }));

export default router;
