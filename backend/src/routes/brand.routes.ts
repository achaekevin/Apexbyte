import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller';

const router = Router();

router.get('/', getBrands);
router.get('/:id', getBrand);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), uploadSingle, createBrand);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), uploadSingle, updateBrand);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), deleteBrand);

export default router;
