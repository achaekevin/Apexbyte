import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../config/email';

export const submitReturnRequest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { orderId, reason, description, items, evidenceUrls } = req.body;

  if (!orderId) {
    throw new AppError('orderId is required', 400);
  }

  if (!reason) {
    throw new AppError('Return reason is required (e.g. DEFECTIVE, WRONG_ITEM, NOT_AS_DESCRIBED, CHANGED_MIND)', 400);
  }

  if (!description || description.trim().length < 10) {
    throw new AppError('Please provide a description of the issue (at least 10 characters)', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      returnRequests: true,
      user: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied: You do not own this order', 403);
  }

  // Returns are only allowed for DELIVERED orders
  if (order.status !== 'DELIVERED') {
    throw new AppError(
      `Returns can only be requested for delivered orders. Current order status is "${order.status}".`,
      400
    );
  }

  // Enforce 7-Day return policy window from delivery
  const deliveryDate = order.deliveredAt || order.updatedAt;
  const daysSinceDelivery = Math.floor(
    (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceDelivery > 7) {
    throw new AppError(
      `Return window has expired. Returns must be requested within 7 days of delivery (Delivered ${daysSinceDelivery} days ago).`,
      400
    );
  }

  // Prevent duplicate open return requests
  const openReturn = order.returnRequests.find((r) =>
    ['PENDING', 'APPROVED', 'RECEIVED', 'INSPECTED'].includes(r.status)
  );
  if (openReturn) {
    throw new AppError(
      `There is already an active return request (#${openReturn.returnNumber}) for this order.`,
      400
    );
  }

  const returnNumber = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Validate items to return
  const returnItemsToCreate = (items && items.length > 0)
    ? items.map((i: any) => ({
        orderItemId: i.orderItemId,
        quantity: Math.max(1, Number(i.quantity) || 1),
        condition: i.condition || 'DEFECTIVE',
      }))
    : order.items.map((i) => ({
        orderItemId: i.id,
        quantity: i.quantity,
        condition: 'DEFECTIVE',
      }));

  const createdRequest = await prisma.$transaction(async (tx) => {
    const returnReq = await tx.returnRequest.create({
      data: {
        returnNumber,
        orderId: order.id,
        userId,
        reason,
        description: description.trim(),
        evidenceUrls: evidenceUrls ? JSON.stringify(evidenceUrls) : null,
        status: 'PENDING',
        refundAmount: order.total,
        items: {
          create: returnItemsToCreate,
        },
      },
      include: {
        items: true,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: 'RETURN_REQUESTED' },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: 'DELIVERED',
        newStatus: 'RETURN_REQUESTED',
        notes: `Return requested by customer. Return #${returnNumber}. Reason: ${reason}`,
        changedBy: userId,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Return Request Received',
        message: `Your return request #${returnNumber} for order #${order.orderNumber} has been logged. Our quality assurance team at Mocha Place, Kisii will review it within 24 hours.`,
        data: JSON.stringify({ returnNumber, orderId: order.id }),
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'RETURN_REQUEST_SUBMITTED',
        entity: 'ReturnRequest',
        entityId: returnReq.id,
        changes: JSON.stringify({ returnNumber, orderId: order.id, reason }),
        ipAddress: req.ip,
      },
    });

    return returnReq;
  });

  if (req.user.email) {
    sendEmail({
      to: req.user.email,
      subject: `Return Request #${returnNumber} - Order #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Return Request Received</h2>
          <p>Hi ${req.user.firstName || 'Customer'},</p>
          <p>We have received your return request for Order <strong>#${order.orderNumber}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Return Reference:</strong> #${returnNumber}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Details:</strong> ${description}</p>
          </div>
          <p>We will review your claim and send return shipping or drop-off instructions shortly.</p>
        </div>
      `,
    }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    message: 'Return request submitted successfully',
    data: createdRequest,
  });
});

export const getMyReturns = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where: { userId },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            createdAt: true,
          },
        },
        items: {
          include: {
            orderItem: {
              select: {
                productName: true,
                productSku: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.returnRequest.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: returns,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getReturnById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: true,
      items: {
        include: {
          orderItem: true,
        },
      },
    },
  });

  if (!returnReq) {
    throw new AppError('Return request not found', 404);
  }

  if (returnReq.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: returnReq,
  });
});

// Admin: Get all return requests
export const getAllReturnRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { returnNumber: { contains: String(search) } },
      { order: { orderNumber: { contains: String(search) } } },
      { user: { email: { contains: String(search) } } },
    ];
  }

  const [returns, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      include: {
        order: {
          select: { orderNumber: true, total: true },
        },
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        items: {
          include: {
            orderItem: {
              select: { productName: true, productSku: true, price: true, quantity: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.returnRequest.count({ where }),
  ]);

  res.json({
    success: true,
    data: returns,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Admin: Update return request status (Approve, Reject, Inspect)
export const updateReturnStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id },
    include: { user: true, order: true },
  });

  if (!returnReq) {
    throw new AppError('Return request not found', 404);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedReturn = await tx.returnRequest.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || returnReq.adminNotes,
        reviewedBy: req.user.id,
      },
    });

    // If approved or received, advance order status to RETURNED
    if (['RECEIVED', 'INSPECTED'].includes(status)) {
      await tx.order.update({
        where: { id: returnReq.orderId },
        data: { status: 'RETURNED' },
      });
    }

    await tx.orderStatusHistory.create({
      data: {
        orderId: returnReq.orderId,
        previousStatus: returnReq.order.status,
        newStatus: ['RECEIVED', 'INSPECTED'].includes(status) ? 'RETURNED' : returnReq.order.status,
        notes: `Return #${returnReq.returnNumber} status updated to ${status}. ${adminNotes ? `Notes: ${adminNotes}` : ''}`,
        changedBy: req.user.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: returnReq.userId,
        type: 'SYSTEM',
        title: `Return Request #${returnReq.returnNumber} Update`,
        message: `Your return request status is now ${status}. ${adminNotes || ''}`,
        data: JSON.stringify({ returnNumber: returnReq.returnNumber, status }),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RETURN_STATUS_UPDATED',
        entity: 'ReturnRequest',
        entityId: id,
        changes: JSON.stringify({ oldStatus: returnReq.status, newStatus: status, adminNotes }),
        ipAddress: req.ip,
      },
    });

    return updatedReturn;
  });

  if (returnReq.user?.email) {
    sendEmail({
      to: returnReq.user.email,
      subject: `Return Request #${returnReq.returnNumber} Status: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Return Request Update</h2>
          <p>Hi ${returnReq.user.firstName || 'Customer'},</p>
          <p>Your return request for order <strong>#${returnReq.order.orderNumber}</strong> has been updated to <strong>${status}</strong>.</p>
          ${adminNotes ? `<p><strong>Inspection / Review Notes:</strong> ${adminNotes}</p>` : ''}
          <p>Please log in to your dashboard to view complete details.</p>
        </div>
      `,
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: `Return request updated to ${status}`,
    data: updated,
  });
});

// Admin: Process return refund & restocking
export const processReturnRefund = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { refundAmount, restock = true, reason } = req.body;

  const returnReq = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          payments: true,
        },
      },
      items: {
        include: {
          orderItem: true,
        },
      },
      user: true,
    },
  });

  if (!returnReq) {
    throw new AppError('Return request not found', 404);
  }

  if (returnReq.status === 'REFUNDED') {
    throw new AppError('This return has already been refunded', 400);
  }

  const orderTotal = Number(returnReq.order.total);
  const amountToRefund = Number(refundAmount) || Number(returnReq.refundAmount) || orderTotal;

  // Strict Financial Integrity: Prevent refunds exceeding total paid
  if (amountToRefund <= 0 || amountToRefund > orderTotal) {
    throw new AppError(
      `Invalid refund amount KSh ${amountToRefund}. Maximum permitted refund is KSh ${orderTotal}`,
      400
    );
  }

  // Calculate existing refunded amount on this order
  const alreadyRefunded = returnReq.order.payments.reduce(
    (sum, p) => sum + (Number(p.refundedAmount) || 0),
    0
  );
  if (alreadyRefunded + amountToRefund > orderTotal) {
    throw new AppError(
      `Total refund would exceed order amount. Already refunded: KSh ${alreadyRefunded}, Max additional: KSh ${orderTotal - alreadyRefunded}`,
      400
    );
  }

  // Execute refund & optional restocking atomically
  await prisma.$transaction(async (tx) => {
    // 1. Update ReturnRequest
    await tx.returnRequest.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundAmount: amountToRefund,
        restocked: Boolean(restock),
        adminNotes: reason || returnReq.adminNotes,
        reviewedBy: req.user.id,
      },
    });

    // 2. Update Order
    await tx.order.update({
      where: { id: returnReq.orderId },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
      },
    });

    // 3. Update or create payment refund record
    const primaryPayment = returnReq.order.payments.find((p) => p.status === 'PAID') || returnReq.order.payments[0];
    if (primaryPayment) {
      await tx.payment.update({
        where: { id: primaryPayment.id },
        data: {
          status: 'REFUNDED',
          refundedAmount: (Number(primaryPayment.refundedAmount) || 0) + amountToRefund,
          refundedAt: new Date(),
          refundReason: reason || `Return #${returnReq.returnNumber} approved refund`,
        },
      });
    }

    // 4. Record order status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: returnReq.orderId,
        previousStatus: returnReq.order.status,
        newStatus: 'REFUNDED',
        notes: `Refund of KSh ${amountToRefund.toLocaleString('en-KE')} processed for Return #${returnReq.returnNumber}. Restocked: ${restock ? 'Yes' : 'No'}`,
        changedBy: req.user.id,
      },
    });

    // 5. Restock physical units if items passed inspection
    if (restock) {
      for (const retItem of returnReq.items) {
        const product = await tx.product.findUnique({
          where: { id: retItem.orderItem.productId },
          select: { stock: true },
        });

        const currentStock = product?.stock || 0;
        const updated = await tx.product.update({
          where: { id: retItem.orderItem.productId },
          data: {
            stock: { increment: retItem.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productId: retItem.orderItem.productId,
            action: 'RETURN',
            quantity: retItem.quantity,
            previousStock: currentStock,
            newStock: updated.stock,
            reason: `Restocked from Return #${returnReq.returnNumber}`,
            reference: returnReq.returnNumber,
            createdBy: req.user.id,
          },
        });
      }
    }

    // 6. Invalidate associated warranties
    for (const retItem of returnReq.items) {
      await tx.warranty.updateMany({
        where: { orderItemId: retItem.orderItemId },
        data: { isActive: false },
      });
    }

    // 7. Notification & Audit Log
    await tx.notification.create({
      data: {
        userId: returnReq.userId,
        type: 'SYSTEM',
        title: 'Refund Processed',
        message: `Your refund of KSh ${amountToRefund.toLocaleString('en-KE')} for Return #${returnReq.returnNumber} has been issued.`,
        data: JSON.stringify({ returnNumber: returnReq.returnNumber, refundAmount: amountToRefund }),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RETURN_REFUND_PROCESSED',
        entity: 'ReturnRequest',
        entityId: id,
        changes: JSON.stringify({ returnNumber: returnReq.returnNumber, refundAmount: amountToRefund, restocked: restock }),
        ipAddress: req.ip,
      },
    });
  });

  if (returnReq.user?.email) {
    sendEmail({
      to: returnReq.user.email,
      subject: `Refund Processed - Return #${returnReq.returnNumber} [KSh ${amountToRefund.toLocaleString('en-KE')}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669;">Refund Issued</h2>
          <p>Hi ${returnReq.user.firstName || 'Customer'},</p>
          <p>A refund of <strong>KSh ${amountToRefund.toLocaleString('en-KE')}</strong> has been approved and issued for Return <strong>#${returnReq.returnNumber}</strong>.</p>
          <p>M-Pesa disbursements reflect within 24 hours. For card orders, funds reflect within 3-5 business days depending on your bank.</p>
          <p>Thank you for shopping with Apexbyte Laptops Kenya.</p>
        </div>
      `,
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: `Refund of KSh ${amountToRefund} processed successfully`,
  });
});
