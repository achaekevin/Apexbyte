import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller';

const router = Router();

router.use(authenticate);

const addItemValidation = [
  body('productId').trim().notEmpty().withMessage('Product ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updateItemValidation = [
  param('id').trim().notEmpty().withMessage('Cart item ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const idParamValidation = [
  param('id').trim().notEmpty().withMessage('Cart item ID is required'),
];

router.get('/', getCart);
router.post('/items', validate(addItemValidation), addToCart);
router.put('/items/:id', validate(updateItemValidation), updateCartItem);
router.delete('/items/:id', validate(idParamValidation), removeFromCart);
router.delete('/clear', clearCart);

export default router;
