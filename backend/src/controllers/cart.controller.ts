import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              brand: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
                brand: true,
              },
            },
          },
        },
      },
    });
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  res.json({
    success: true,
    data: {
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    },
  });
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  // Check if product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    if (product.stock < existingItem.quantity + quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    // Add new item
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              brand: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Item added to cart',
    data: updatedCart,
  });
});

export const updateCartItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    throw new AppError('Quantity must be at least 1', 400);
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      cart: true,
      product: true,
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  if (cartItem.product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              brand: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Cart updated',
    data: updatedCart,
  });
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({ where: { id } });

  const updatedCart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              brand: true,
            },
          },
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: updatedCart,
  });
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const cart = await prisma.cart.findUnique({ where: { userId } });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  res.json({
    success: true,
    message: 'Cart cleared',
  });
});
