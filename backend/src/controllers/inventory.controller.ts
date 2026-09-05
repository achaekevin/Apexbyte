import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getInventoryLogs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, productId, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (productId) where.productId = String(productId);
    if (type) where.type = String(type);

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.inventoryLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const getLowStockProducts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { threshold = 10 } = req.query;

    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: Number(threshold),
        },
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        brand: {
          select: {
            name: true,
          },
        },
        images: true,
      },
      orderBy: { stock: 'asc' },
    });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  }
);

export const getOutOfStockProducts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const products = await prisma.product.findMany({
      where: {
        stock: 0,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        brand: {
          select: {
            name: true,
          },
        },
        images: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: products,
      count: products.length,
    });
  }
);

export const updateStock = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { quantity, reason, type = 'ADJUSTMENT' } = req.body;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true, name: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const quantityChange = Number(quantity);
    const newStock = product.stock + quantityChange;

    if (newStock < 0) {
      throw new AppError('Stock cannot be negative', 400);
    }

    const [updatedProduct] = await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { stock: newStock },
      }),
      prisma.inventoryLog.create({
        data: {
          productId: id,
          action: 'ADJUSTMENT',
          quantity: Math.abs(quantityChange),
          previousStock: product.stock,
          newStock,
          reason: reason || 'Manual stock adjustment',
          createdBy: req.user?.id,
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: id,
        previousStock: product.stock,
        newStock,
        quantityChange,
      },
    });
  }
);

export const bulkUpdateStock = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      throw new AppError('Updates array is required', 400);
    }

    const results = [];

    for (const update of updates) {
      const { productId, quantity, reason } = update;

      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stock: true },
      });

      if (!product) {
        results.push({
          productId,
          success: false,
          error: 'Product not found',
        });
        continue;
      }

      const newStock = product.stock + Number(quantity);

      if (newStock < 0) {
        results.push({
          productId,
          success: false,
          error: 'Stock cannot be negative',
        });
        continue;
      }

      try {
        await prisma.$transaction([
          prisma.product.update({
            where: { id: productId },
            data: { stock: newStock },
          }),
          prisma.inventoryLog.create({
            data: {
              productId,
              action: 'ADJUSTMENT',
              quantity: Math.abs(Number(quantity)),
              previousStock: product.stock,
              newStock,
              reason: reason || 'Bulk stock adjustment',
              createdBy: req.user?.id,
            },
          }),
        ]);

        results.push({
          productId,
          success: true,
          previousStock: product.stock,
          newStock,
        });
      } catch (error) {
        results.push({
          productId,
          success: false,
          error: 'Failed to update stock',
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk stock update completed',
      data: results,
    });
  }
);

export const getInventoryStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
      recentLogs,
    ] = await Promise.all([
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.product.count({
        where: {
          stock: { lte: 10, gt: 0 },
          status: 'PUBLISHED',
        },
      }),
      prisma.product.count({
        where: {
          stock: 0,
          status: 'PUBLISHED',
        },
      }),
      prisma.product.aggregate({
        where: { status: 'PUBLISHED' },
        _sum: {
          stock: true,
        },
      }),
      prisma.inventoryLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        lowStockCount,
        outOfStockCount,
        totalStockUnits: totalStockValue._sum?.stock || 0,
        recentLogs,
      },
    });
  }
);

export const getStockHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, sku: true, stock: true },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where: { productId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.inventoryLog.count({ where: { productId: id } }),
    ]);

    res.json({
      success: true,
      data: {
        product,
        logs,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const createStockAlert = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { productId, threshold } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: { lowStockThreshold: Number(threshold) || 10 },
      select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true },
    });

    res.status(201).json({
      success: true,
      message: 'Low stock threshold configured successfully',
      data: product,
    });
  }
);

export const getStockAlerts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 },
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
      },
      orderBy: { stock: 'asc' },
    });

    res.json({
      success: true,
      data: lowStockProducts.map((p) => ({
        id: p.id,
        productId: p.id,
        threshold: p.lowStockThreshold,
        enabled: true,
        product: p,
      })),
    });
  }
);

export const updateStockAlert = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { threshold } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        lowStockThreshold: threshold ? Number(threshold) : 10,
      },
      select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true },
    });

    res.json({
      success: true,
      message: 'Stock alert threshold updated successfully',
      data: product,
    });
  }
);

export const deleteStockAlert = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { lowStockThreshold: 10 },
    });

    res.json({
      success: true,
      message: 'Stock alert reset to default successfully',
    });
  }
);
