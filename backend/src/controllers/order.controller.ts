import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateOrderNumber, calculateTax } from '../utils/helpers';
import { sendOrderConfirmationEmail, sendEmail } from '../config/email';

// State machine for permitted order status transitions
const PERMITTED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'DELIVERED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const {
    items,
    shippingAddressId,
    billingAddressId,
    paymentMethod = 'MPESA',
    couponCode,
    notes,
    guestEmail,
    guestFirstName,
    guestLastName,
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('No items in order', 400);
  }

  let resolvedShippingId = shippingAddressId;
  let resolvedBillingId = billingAddressId;

  if (userId && (!resolvedShippingId || !resolvedBillingId) && req.body.shippingAddress) {
    const s = req.body.shippingAddress;
    const createdAddress = await prisma.address.create({
      data: {
        userId,
        fullName: `${s.firstName || 'Customer'} ${s.lastName || ''}`.trim(),
        phone: s.phone || '0104504692',
        addressLine1: s.address || 'Kisii Town',
        city: s.city || 'Kisii',
        state: s.state || 'Kisii',
        postalCode: s.zipCode || '40200',
        country: s.country || 'Kenya',
        type: 'HOME',
      },
    });
    resolvedShippingId = resolvedShippingId || createdAddress.id;
    resolvedBillingId = resolvedBillingId || createdAddress.id;
  }

  // Validate addresses for logged-in users
  if (userId && (!resolvedShippingId || !resolvedBillingId)) {
    throw new AppError('Shipping and billing addresses are required', 400);
  }

  // Use interactive database transaction to guarantee concurrency safety and atomic stock reservation
  const order = await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    const preparedItems: any[] = [];

    for (const item of items) {
      if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
        throw new AppError('Invalid order item quantity or product ID', 400);
      }

      // Re-fetch product inside transaction for up-to-date stock
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: { images: { where: { isMain: true }, take: 1 } },
      });

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      // Concurrency check: prevent negative stock or overselling
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
          400
        );
      }

      const itemPrice = Number(product.price);
      const itemDiscount = Number(product.discount) || 0;
      const discountedPrice = itemPrice - (itemPrice * itemDiscount) / 100;
      const itemTotal = discountedPrice * item.quantity;

      subtotal += itemTotal;

      preparedItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: discountedPrice,
        discount: itemDiscount,
        total: itemTotal,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images[0]?.url || null,
        currentStock: product.stock,
      });
    }

    // Server-side Coupon validation
    let discount = 0;
    if (couponCode) {
      const coupon = await tx.coupon.findUnique({
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
            // Increment coupon use
            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = calculateTax(afterDiscount, 8); // 8% VAT
    const shippingCost = afterDiscount > 50000 ? 0 : 1500; // Free shipping over KSh 50,000
    const total = afterDiscount + tax + shippingCost;
    const generatedOrderNumber = generateOrderNumber();

    // Create Order Record
    const createdOrder = await tx.order.create({
      data: {
        orderNumber: generatedOrderNumber,
        userId,
        guestEmail,
        guestFirstName,
        guestLastName,
        shippingAddressId: resolvedShippingId,
        billingAddressId: resolvedBillingId,
        subtotal,
        discount,
        tax,
        shippingCost,
        total,
        paymentMethod,
        couponCode,
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: preparedItems.map(({ currentStock, ...itemData }) => itemData),
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

    // Atomic stock decrement and accurate inventory log creation
    for (const item of preparedItems) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity },
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          action: 'STOCK_OUT',
          quantity: item.quantity,
          previousStock: item.currentStock,
          newStock: updatedProduct.stock,
          reason: `Purchased in Order ${generatedOrderNumber}`,
          reference: generatedOrderNumber,
          createdBy: userId || 'GUEST',
        },
      });
    }

    // Log initial status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: createdOrder.id,
        previousStatus: null,
        newStatus: 'PENDING',
        notes: `Order created via checkout. Total: KSh ${total.toLocaleString('en-KE')}. Payment method: ${paymentMethod}`,
        changedBy: userId || 'GUEST',
      },
    });

    // Clear cart if authenticated user
    if (userId) {
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return createdOrder;
  });

  // Asynchronously dispatch confirmation email
  const email = userId ? req.user.email : guestEmail;
  const customerName = userId
    ? `${req.user.firstName} ${req.user.lastName}`
    : `${guestFirstName || ''} ${guestLastName || ''}`.trim() || 'Customer';

  if (email) {
    sendOrderConfirmationEmail(email, {
      ...order,
      customerName,
    }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
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
            warranty: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.order.count({ where }),
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
          warranty: {
            include: {
              claims: true,
            },
          },
        },
      },
      shippingAddress: true,
      billingAddress: true,
      payments: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
      returnRequests: {
        include: {
          items: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // IDOR protection: customers can only view their own order
  if (order.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied: You do not have permission to view this order', 403);
  }

  res.json({
    success: true,
    data: order,
  });
});

// Guest order lookup with security check
export const getGuestOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderNumber, email } = req.query;

  if (!orderNumber || !email) {
    throw new AppError('Both orderNumber and email are required for guest order tracking', 400);
  }

  const order = await prisma.order.findFirst({
    where: {
      orderNumber: String(orderNumber).trim(),
      guestEmail: {
        equals: String(email).trim(),
      },
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
              brand: true,
            },
          },
          warranty: true,
        },
      },
      shippingAddress: true,
      payments: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found matching the provided order number and email address', 404);
  }

  res.json({
    success: true,
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { reason = 'Cancelled by customer' } = req.body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payments: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied: You cannot cancel this order', 403);
  }

  // Only PENDING and CONFIRMED (un-shipped) orders can be cancelled by customers
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError(
      `Cannot cancel order with status ${order.status}. Orders in processing or already dispatched cannot be self-cancelled.`,
      400
    );
  }

  // Concurrency-safe cancellation and stock restoration
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // Record status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: 'CANCELLED',
        notes: `Order cancelled. Reason: ${reason}`,
        changedBy: userId,
      },
    });

    // Restore stock and create audit logs
    for (const item of order.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      });

      const currentStock = product ? product.stock : 0;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          salesCount: { decrement: item.quantity },
        },
      });

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          action: 'RETURN',
          quantity: item.quantity,
          previousStock: currentStock,
          newStock: updated.stock,
          reason: `Stock restored from cancelled order ${order.orderNumber}`,
          reference: order.orderNumber,
          createdBy: userId,
        },
      });
    }

    // Deactivate any warranties created if payment had gone through
    await tx.warranty.updateMany({
      where: {
        orderItemId: { in: order.items.map((i) => i.id) },
      },
      data: { isActive: false },
    });
  });

  res.json({
    success: true,
    message: 'Order cancelled successfully and stock restored',
  });
});

// Admin: Get all orders with search, filters, and pagination
export const getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, search, paymentStatus } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status !== 'all') where.status = status;
  if (paymentStatus && paymentStatus !== 'all') where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: String(search) } },
      { guestEmail: { contains: String(search) } },
      { user: { email: { contains: String(search) } } },
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
            phone: true,
          },
        },
        items: {
          include: {
            warranty: true,
          },
        },
        payments: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.order.count({ where }),
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

// Admin: Update order status with lifecycle transition validation & history
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber, notes } = req.body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status === status) {
    return res.json({
      success: true,
      message: `Order is already in ${status} status`,
      data: order,
    });
  }

  // Validate status transition against the state machine
  const allowedNext = PERMITTED_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(status) && req.user.role !== 'SUPER_ADMIN') {
    throw new AppError(
      `Invalid order status transition from ${order.status} to ${status}. Allowed transitions: ${
        allowedNext.join(', ') || 'None (terminal state)'
      }`,
      400
    );
  }

  const updateData: any = { status };

  if (status === 'SHIPPED') {
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    updateData.shippedAt = new Date();
  }

  if (status === 'DELIVERED') {
    updateData.deliveredAt = new Date();
  }

  // Transaction to update order, log history, and create warranty upon delivery if not yet created
  const updated = await prisma.$transaction(async (tx) => {
    const resOrder = await tx.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: status,
        notes: notes || `Status changed from ${order.status} to ${status} by admin`,
        changedBy: req.user.id,
      },
    });

    // When an order is DELIVERED, activate 1-year warranty for all items
    if (status === 'DELIVERED') {
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      for (const item of order.items) {
        const existing = await tx.warranty.findUnique({
          where: { orderItemId: item.id },
        });

        if (!existing) {
          await tx.warranty.create({
            data: {
              orderItemId: item.id,
              productId: item.productId,
              userId: order.userId,
              durationMonths: 12,
              warrantyType: 'MANUFACTURER',
              startDate: now,
              endDate: oneYearLater,
              terms:
                '1-Year Comprehensive Internal Hardware Warranty covering motherboard, display, and certified components. Excludes physical liquid spills or unauthorized chassis tampering.',
              isActive: true,
            },
          });
        }
      }
    }

    return resOrder;
  });

  // Notify customer of shipping / delivery update via email
  const customerEmail = order.userId ? order.user?.email : order.guestEmail;
  if (customerEmail && ['SHIPPED', 'DELIVERED'].includes(status)) {
    sendEmail({
      to: customerEmail,
      subject: `Order #${order.orderNumber} Status Update: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Your order is ${status}!</h2>
          <p>Order Number: <strong>${order.orderNumber}</strong></p>
          ${trackingNumber ? `<p>Courier Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
          <p>${notes || 'Your laptop parcel is progressing through our delivery network.'}</p>
          <p><a href="${process.env.CLIENT_URL || 'http://localhost:4000'}/dashboard/orders/${order.id}">Track Order Online</a></p>
        </div>
      `,
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: updated,
  });
});
