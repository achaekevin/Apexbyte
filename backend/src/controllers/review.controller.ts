import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { uploadMultipleImages } from '../config/cloudinary';
import { getPagination, getPaginationMeta } from '../utils/helpers';

export const getProductReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt' } = req.query;

    const { skip, take } = getPagination(Number(page), Number(limit));

    const where: any = { productId, isApproved: true };
    if (rating) where.rating = Number(rating);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          images: true,
        },
        orderBy:
          sortBy === 'helpful'
            ? { helpfulCount: 'desc' }
            : { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.review.count({ where }),
    ]);

    const avgRating = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId, isApproved: true },
      _count: true,
    });

    const formattedReviews = reviews.map((r) => ({
      ...r,
      isVerifiedPurchase: r.isVerified,
      images: r.images.map((img) => (typeof img === 'string' ? img : img.url)),
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        averageRating: avgRating._avg.rating || 0,
        totalReviews: total,
        ratingDistribution,
      },
      pagination: getPaginationMeta(total, Number(page), Number(limit)),
    });
  }
);

export const createReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { productId, rating, title, comment } = req.body;
    const numRating = Number(rating);

    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId, userId },
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', 400);
    }

    // Check if user purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: numRating,
        title: title || '',
        comment,
        isVerified: !!hasPurchased,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        ...review,
        isVerifiedPurchase: review.isVerified,
      },
    });
  }
);

export const updateReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId) {
      throw new AppError('Access denied', 403);
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { rating, title, comment },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        images: true,
      },
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: updated,
    });
  }
);

export const deleteReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId !== userId && req.user.role === 'CUSTOMER') {
      throw new AppError('Access denied', 403);
    }

    await prisma.review.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  }
);

export const markReviewHelpful = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    // Check if user already marked as helpful
    const existing = await prisma.reviewHelpful.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId,
        },
      },
    });

    if (existing) {
      // Remove helpful mark
      await prisma.reviewHelpful.delete({
        where: { id: existing.id },
      });

      await prisma.review.update({
        where: { id },
        data: { helpfulCount: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: 'Removed helpful mark',
      });
    }

    // Add helpful mark
    await prisma.reviewHelpful.create({
      data: { reviewId: id, userId },
    });

    await prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: 'Marked as helpful',
    });
  }
);

export const uploadReviewImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No images provided', 400);
    }

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== userId) {
      throw new AppError('Review not found', 404);
    }

    const uploadedImages = await uploadMultipleImages(files, 'reviews');

    const images = await Promise.all(
      uploadedImages.map((img) =>
        prisma.reviewImage.create({
          data: {
            reviewId: id,
            url: img.url,
          },
        })
      )
    );

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: images,
    });
  }
);

// Admin: Approve review
export const approveReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    res.json({
      success: true,
      message: `Review ${isApproved ? 'approved' : 'rejected'}`,
    });
  }
);

// Admin: Reply to review
export const replyToReview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { adminReply } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      throw new AppError('Review not found', 404);
    }

    await prisma.review.update({
      where: { id },
      data: {
        adminReply,
        repliedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Reply added successfully',
    });
  }
);

// Get all approved reviews across products
export const getAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { page = 1, limit = 12, rating, featured } = req.query;
    const { skip, take } = getPagination(Number(page), Number(limit));

    const where: any = { isApproved: true };
    if (rating) where.rating = Number(rating);
    if (featured === 'true') where.rating = { gte: 4 };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              brand: {
                select: { id: true, name: true, slug: true },
              },
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
          images: true,
        },
        orderBy: [{ helpfulCount: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      prisma.review.count({ where }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      ...r,
      isVerifiedPurchase: r.isVerified,
      product: r.product
        ? {
            ...r.product,
            image:
              r.product.images[0]?.url ||
              'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
            images: r.product.images.map((img) => img.url),
          }
        : null,
    }));

    res.json({
      success: true,
      data: formattedReviews,
      pagination: getPaginationMeta(total, Number(page), Number(limit)),
    });
  }
);

// Get featured top-rated real customer reviews for homepage showcase
export const getFeaturedReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 6;
    const reviews = await prisma.review.findMany({
      where: { isApproved: true, rating: { gte: 4 } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            brand: {
              select: { id: true, name: true, slug: true },
            },
            images: {
              where: { isMain: true },
              take: 1,
            },
          },
        },
        images: true,
      },
      orderBy: [{ helpfulCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    const formattedReviews = reviews.map((r) => ({
      ...r,
      isVerifiedPurchase: r.isVerified,
      product: r.product
        ? {
            ...r.product,
            image:
              r.product.images[0]?.url ||
              'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
            images: r.product.images.map((img) => img.url),
          }
        : null,
    }));

    res.json({
      success: true,
      data: formattedReviews,
    });
  }
);

