import { Router } from 'express';
import {
  getPublicSettings,
  getAllSettingsAdmin,
  updateSettings,
} from '../controllers/setting.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// 1. Public route: any visitor / customer can fetch public store settings
router.get('/public', getPublicSettings);

// 2. Admin routes: require authentication and admin privileges
router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/', getAllSettingsAdmin);
router.put('/', updateSettings);

export default router;

