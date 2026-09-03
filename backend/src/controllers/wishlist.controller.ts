import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  let wishlist = await prisma.wishlist.findUnique({
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

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
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

  res.json({
    success: true,
    data: wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) {
    wishlist = await prisma.wishlist.create({ data: { userId } });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (existing) {
    throw new AppError('Product already in wishlist', 400);
  }

  await prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
  });

  const updated = await prisma.wishlist.findUnique({
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
    message: 'Added to wishlist',
    data: updated,
  });
});

export const removeFromWishlist = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: { wishlist: true },
    });

    if (!item || item.wishlist.userId !== userId) {
      throw new AppError('Item not found', 404);
    }

    await prisma.wishlistItem.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Removed from wishlist',
    });
  }
);
