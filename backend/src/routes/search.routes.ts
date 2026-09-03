import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.json({ success: true, data: { products: [], brands: [], categories: [] } }));
router.get('/suggestions', (req, res) => res.json({ success: true, data: [] }));
router.get('/popular', (req, res) => res.json({ success: true, data: [] }));

export default router;
