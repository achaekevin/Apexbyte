import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateOrderNumber, calculateTax } from '../utils/helpers';
import { sendOrderConfirmationEmail } from '../config/email';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const {
    items,
    shippingAddressId,
    billingAddressId,
    paymentMethod,
    couponCode,
    notes,
    guestEmail,
    guestFirstName,
    guestLastName,
  } = req.body;

  if (!items || items.length === 0) {
    throw new AppError('No items in order', 400);
  }

  // Validate addresses for logged-in users
  if (userId && (!shippingAddressId || !billingAddressId)) {
    throw new AppError('Shipping and billing addresses are required', 400);
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { images: { where: { isMain: true }, take: 1 } },
    });

    if (!product) {
      throw new AppError(`Product ${item.productId} not found`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    const itemPrice = Number(product.price);
    const itemDiscount = Number(product.discount) || 0;
    const discountedPrice = itemPrice - (itemPrice * itemDiscount) / 100;
    const itemTotal = discountedPrice * item.quantity;

    subtotal += itemTotal;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: discountedPrice,
      discount: itemDiscount,
      total: itemTotal,
      productName: product.name,
      productSku: product.sku,
      productImage: product.images[0]?.url,
    });
  }

  // Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (coupon && coupon.isActive) {
      const now = new Date();
      if (now >= coupon.startDate && now <= coupon.endDate) {
        if (subtotal >= Number(coupon.minPurchase || 0)) {
          if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) {
              discount = Math.min(discount, Number(coupon.maxDiscount));
            }
          } else {
            discount = Number(coupon.value);
          }
        }
      }
    }
  }

  const afterDiscount = subtotal - discount;
  const tax = calculateTax(afterDiscount, 8); // 8% tax rate
  const shippingCost = afterDiscount > 500 ? 0 : 25; // Free shipping over $500
  const total = afterDiscount + tax + shippingCost;

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      guestEmail,
      guestFirstName,
      guestLastName,
      shippingAddressId,
      billingAddressId,
      subtotal,
      discount,
      tax,
      shippingCost,
      total,
      paymentMethod,
      couponCode,
      notes,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  });

  // Update product stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        salesCount: { increment: item.quantity },
      },
    });

    // Log inventory change
    await prisma.inventoryLog.create({
      data: {
        productId: item.productId,
        action: 'STOCK_OUT',
        quantity: item.quantity,
        previousStock: 0, // Would need to fetch this before update
        newStock: 0, // Would need to fetch after update
        reason: `Order ${order.orderNumber}`,
        reference: order.orderNumber,
      },
    });
  }

  // Clear cart if user is logged in
  if (userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }

  // Send confirmation email
  const email = userId ? req.user.email : guestEmail;
  const customerName = userId
    ? `${req.user.firstName} ${req.user.lastName}`
    : `${guestFirstName} ${guestLastName}`;

  await sendOrderConfirmationEmail(email, {
    ...order,
    customerName,
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.max(1, parseInt(limit as string) || 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId };
  if (status && status !== 'all') {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findUnique({
    where: { id },
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
      shippingAddress: true,
      billingAddress: true,
      payments: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== userId) {
    throw new AppError('Access denied', 403);
  }

  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Cannot cancel order at this stage', 400);
  }

  // Update order status
  await prisma.order.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  // Restore stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
        salesCount: { decrement: item.quantity },
      },
    });
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
  });
});

// Admin: Get all orders
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search as string } },
      { guestEmail: { contains: search as string } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.order.count({ where }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

// Admin: Update order status
export const updateOrderStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updateData: any = { status };

    if (status === 'SHIPPED' && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: updated,
    });
  }
);
