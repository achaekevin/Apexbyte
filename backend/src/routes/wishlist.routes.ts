import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller';

const router = Router();

router.use(authenticate);

const addItemValidation = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
];

const idParamValidation = [
  param('id').trim().notEmpty().withMessage('Wishlist item ID is required'),
];

router.get('/', getWishlist);
router.post('/items', validate(addItemValidation), addToWishlist);
router.delete('/items/:id', validate(idParamValidation), removeFromWishlist);

export default router;
