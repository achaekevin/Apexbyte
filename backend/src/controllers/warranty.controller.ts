import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail } from '../config/email';

export const getMyWarranties = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, activeOnly } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId };
  if (activeOnly === 'true') {
    where.isActive = true;
    where.endDate = { gte: new Date() };
  }

  const [warranties, total] = await Promise.all([
    prisma.warranty.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            images: { where: { isMain: true }, take: 1 },
          },
        },
        orderItem: {
          select: {
            id: true,
            price: true,
            productName: true,
            productSku: true,
            order: {
              select: {
                id: true,
                orderNumber: true,
                createdAt: true,
              },
            },
          },
        },
        claims: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.warranty.count({ where }),
  ]);

  res.json({
    success: true,
    data: warranties,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getWarrantyById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  const warranty = await prisma.warranty.findUnique({
    where: { id },
    include: {
      product: true,
      orderItem: {
        include: {
          order: true,
        },
      },
      claims: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!warranty) {
    throw new AppError('Warranty record not found', 404);
  }

  if (warranty.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied: You do not own this warranty', 403);
  }

  res.json({
    success: true,
    data: warranty,
  });
});

export const submitWarrantyClaim = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { warrantyId, issueDescription, evidenceUrls } = req.body;

  if (!warrantyId) {
    throw new AppError('warrantyId is required', 400);
  }

  if (!issueDescription || issueDescription.trim().length < 10) {
    throw new AppError('Please provide a detailed issue description (at least 10 characters)', 400);
  }

  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
    include: {
      product: true,
      user: true,
    },
  });

  if (!warranty) {
    throw new AppError('Warranty record not found', 404);
  }

  if (warranty.userId !== userId && req.user.role === 'CUSTOMER') {
    throw new AppError('Access denied: You do not own this warranty', 403);
  }

  if (!warranty.isActive) {
    throw new AppError('This warranty is void or no longer active', 400);
  }

  const now = new Date();
  if (now > warranty.endDate) {
    throw new AppError(
      `This warranty expired on ${warranty.endDate.toLocaleDateString()}. Claims can only be filed during active coverage.`,
      400
    );
  }

  // Prevent duplicate open claims on the same warranty
  const openClaim = await prisma.warrantyClaim.findFirst({
    where: {
      warrantyId,
      status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REPAIR_IN_PROGRESS', 'REPLACEMENT_ARRANGED'] },
    },
  });

  if (openClaim) {
    throw new AppError(
      `There is already an active claim (#${openClaim.claimNumber}) in progress for this laptop.`,
      400
    );
  }

  const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const claim = await prisma.$transaction(async (tx) => {
    const createdClaim = await tx.warrantyClaim.create({
      data: {
        claimNumber,
        warrantyId: warranty.id,
        userId,
        issueDescription: issueDescription.trim(),
        evidenceUrls: evidenceUrls ? JSON.stringify(evidenceUrls) : null,
        status: 'SUBMITTED',
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Warranty Claim Submitted',
        message: `Your warranty claim #${claimNumber} for ${warranty.product.name} has been received. Our engineers will review it within 24-48 hours.`,
        data: JSON.stringify({ claimId: createdClaim.id, claimNumber }),
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'WARRANTY_CLAIM_SUBMITTED',
        entity: 'WarrantyClaim',
        entityId: createdClaim.id,
        changes: JSON.stringify({ claimNumber, warrantyId }),
        ipAddress: req.ip,
      },
    });

    return createdClaim;
  });

  // Send confirmation email
  if (req.user.email) {
    sendEmail({
      to: req.user.email,
      subject: `Warranty Claim #${claimNumber} Received - Apexbyte Laptops`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Warranty Claim Received</h2>
          <p>Hi ${req.user.firstName || 'Customer'},</p>
          <p>Your warranty claim for <strong>${warranty.product.name}</strong> has been assigned reference number <strong>#${claimNumber}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p><strong>Status:</strong> SUBMITTED (Under Initial Review)</p>
            <p><strong>Reported Fault:</strong> ${issueDescription}</p>
            <p><strong>Technical Desk:</strong> Mocha Place 2nd Floor, Kisii CBD</p>
          </div>
          <p>We will update you as soon as our bench diagnostic review begins.</p>
        </div>
      `,
    }).catch(() => {});
  }

  res.status(201).json({
    success: true,
    message: 'Warranty claim submitted successfully',
    data: claim,
  });
});

export const getMyClaims = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [claims, total] = await Promise.all([
    prisma.warrantyClaim.findMany({
      where: { userId },
      include: {
        warranty: {
          include: {
            product: {
              select: {
                name: true,
                sku: true,
                images: { where: { isMain: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.warrantyClaim.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: claims,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Admin: Get all warranties
export const getAllWarranties = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, search, active } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (active === 'true') where.isActive = true;
  if (active === 'false') where.isActive = false;
  if (search) {
    where.OR = [
      { serialNumber: { contains: String(search) } },
      { product: { name: { contains: String(search) } } },
      { user: { email: { contains: String(search) } } },
    ];
  }

  const [warranties, total] = await Promise.all([
    prisma.warranty.findMany({
      where,
      include: {
        product: {
          select: { name: true, sku: true },
        },
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
        orderItem: {
          select: {
            order: { select: { orderNumber: true } },
          },
        },
        claims: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.warranty.count({ where }),
  ]);

  res.json({
    success: true,
    data: warranties,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Admin: Register or update laptop serial number
export const updateSerialNumber = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { serialNumber } = req.body;

  if (!serialNumber || !serialNumber.trim()) {
    throw new AppError('serialNumber is required', 400);
  }

  const updated = await prisma.warranty.update({
    where: { id },
    data: { serialNumber: serialNumber.trim().toUpperCase() },
  });

  await prisma.auditLog.create({
    data: {
      userId: req.user.id,
      action: 'WARRANTY_SERIAL_UPDATED',
      entity: 'Warranty',
      entityId: id,
      changes: JSON.stringify({ serialNumber: updated.serialNumber }),
      ipAddress: req.ip,
    },
  });

  res.json({
    success: true,
    message: 'Serial number registered successfully',
    data: updated,
  });
});

// Admin: Get all warranty claims
export const getAllWarrantyClaims = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 20);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status && status !== 'all') where.status = status;
  if (search) {
    where.OR = [
      { claimNumber: { contains: String(search) } },
      { user: { email: { contains: String(search) } } },
      { warranty: { serialNumber: { contains: String(search) } } },
    ];
  }

  const [claims, total] = await Promise.all([
    prisma.warrantyClaim.findMany({
      where,
      include: {
        warranty: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
        user: {
          select: { firstName: true, lastName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.warrantyClaim.count({ where }),
  ]);

  res.json({
    success: true,
    data: claims,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// Admin: Update claim status & resolution
export const updateWarrantyClaimStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, resolutionNotes } = req.body;

  const claim = await prisma.warrantyClaim.findUnique({
    where: { id },
    include: {
      user: true,
      warranty: {
        include: { product: true },
      },
    },
  });

  if (!claim) {
    throw new AppError('Warranty claim not found', 404);
  }

  const isResolved = ['RESOLVED', 'REJECTED'].includes(status);

  const updatedClaim = await prisma.$transaction(async (tx) => {
    const updated = await tx.warrantyClaim.update({
      where: { id },
      data: {
        status,
        resolutionNotes: resolutionNotes || claim.resolutionNotes,
        resolvedAt: isResolved ? new Date() : claim.resolvedAt,
        reviewedBy: req.user.id,
      },
    });

    await tx.notification.create({
      data: {
        userId: claim.userId,
        type: 'SYSTEM',
        title: `Warranty Claim #${claim.claimNumber} Update`,
        message: `Your warranty claim status has been updated to ${status}. ${resolutionNotes ? `Resolution: ${resolutionNotes}` : ''}`,
        data: JSON.stringify({ claimId: claim.id, claimNumber: claim.claimNumber, status }),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'WARRANTY_CLAIM_UPDATED',
        entity: 'WarrantyClaim',
        entityId: id,
        changes: JSON.stringify({ oldStatus: claim.status, newStatus: status, resolutionNotes }),
        ipAddress: req.ip,
      },
    });

    return updated;
  });

  if (claim.user?.email) {
    sendEmail({
      to: claim.user.email,
      subject: `Warranty Claim #${claim.claimNumber} Status: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Warranty Claim Status Update</h2>
          <p>Hi ${claim.user.firstName || 'Customer'},</p>
          <p>Your warranty claim for <strong>${claim.warranty.product.name}</strong> is now marked as <strong>${status}</strong>.</p>
          ${resolutionNotes ? `<p><strong>Technician Notes:</strong> ${resolutionNotes}</p>` : ''}
          <p>Visit your dashboard online to view the complete diagnostic record.</p>
        </div>
      `,
    }).catch(() => {});
  }

  res.json({
    success: true,
    message: `Warranty claim updated to ${status}`,
    data: updatedClaim,
  });
});
