import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateCouponCode } from '../utils/helpers';

export const validateCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { code, subtotal } = req.body;

    if (!code) {
      throw new AppError('Coupon code is required', 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new AppError('Invalid coupon code', 404);
    }

    if (!coupon.isActive) {
      throw new AppError('This coupon is no longer active', 400);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new AppError('This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      throw new AppError(
        `Minimum purchase of $${coupon.minPurchase} required`,
        400
      );
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else if (coupon.type === 'FIXED_AMOUNT') {
      discountAmount = Number(coupon.value);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        description: coupon.description,
      },
    });
  }
);

export const getCoupons = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, isActive } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.coupon.count({ where }),
  ]);

  res.json({
    success: true,
    data: coupons,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getCoupon = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const coupon = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  res.json({
    success: true,
    data: coupon,
  });
});

export const createCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      code,
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
    } = req.body;

    let couponCode = code || generateCouponCode();
    couponCode = couponCode.toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (existing) {
      throw new AppError('Coupon code already exists', 400);
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        description,
        type,
        value: Number(value),
        minPurchase: minPurchase ? Number(minPurchase) : null,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  }
);

export const updateCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      description,
      type,
      value,
      minPurchase,
      maxDiscount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        description,
        type,
        value: value ? Number(value) : undefined,
        minPurchase: minPurchase ? Number(minPurchase) : undefined,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        perUserLimit: perUserLimit ? Number(perUserLimit) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
      },
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: updated,
    });
  }
);

export const deleteCoupon = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new AppError('Coupon not found', 404);
    }

    await prisma.coupon.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  }
);

export const getActiveCoupons = asyncHandler(
  async (req: Request, res: Response) => {
    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        code: true,
        description: true,
        type: true,
        value: true,
        minPurchase: true,
        maxDiscount: true,
      },
      orderBy: { value: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: coupons,
    });
  }
);
