import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller';

const router = Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/items', addToWishlist);
router.delete('/items/:id', removeFromWishlist);

export default router;
