import { Router } from 'express';
import { searchLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(searchLimiter);

router.get('/', (req, res) => res.json({ success: true, data: { products: [], brands: [], categories: [] } }));
router.get('/suggestions', (req, res) => res.json({ success: true, data: [] }));
router.get('/popular', (req, res) => res.json({ success: true, data: [] }));

export default router;
