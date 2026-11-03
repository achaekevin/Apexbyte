import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { hashPassword, sanitizeUser } from '../utils/helpers';
import logger from '../config/logger';

/**
 * Get all administrators (ADMIN & SUPER_ADMIN)
 * Only accessible by logged-in ADMIN or SUPER_ADMIN
 */
export const getAdmins = asyncHandler(async (req: AuthRequest, res: Response) => {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPER_ADMIN'],
      },
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatar: true,
      role: true,
      isVerified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: admins.map((admin) => ({
      ...admin,
      fullName: `${admin.firstName} ${admin.lastName}`.trim(),
    })),
  });
});

/**
 * Create a new administrator
 * Strictly restricted: only already logged-in ADMIN or SUPER_ADMIN can create another admin
 */
export const createAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const creator = req.user;
  const { firstName, lastName, email, password, phone, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    throw new AppError('First name, last name, email, and password are required', 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user already exists with this email
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('A user or administrator with this email already exists', 409);
  }

  // Validate password length
  if (String(password).length < 8) {
    throw new AppError('Admin password must be at least 8 characters long', 400);
  }

  // Only SUPER_ADMIN can grant the SUPER_ADMIN role
  let assignedRole: 'ADMIN' | 'SUPER_ADMIN' = 'ADMIN';
  if (role === 'SUPER_ADMIN') {
    if (creator.role !== 'SUPER_ADMIN') {
      throw new AppError('Only Super Administrators can assign the Super Administrator role', 403);
    }
    assignedRole = 'SUPER_ADMIN';
  }

  // Hash the set credentials
  const hashedPassword = await hashPassword(String(password));

  // Create the new administrator with immediate active & verified status
  const newAdmin = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: hashedPassword,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      phone: phone ? String(phone).trim() : null,
      role: assignedRole,
      isVerified: true, // Pre-verified so they can log in right away with set credentials
      isActive: true,
    },
  });

  logger.info(`[AdminMgmt] Admin "${creator.email}" (${creator.role}) created new admin "${newAdmin.email}" with role "${assignedRole}"`);

  res.status(201).json({
    success: true,
    message: `Administrator "${newAdmin.firstName} ${newAdmin.lastName}" successfully created. They can now log in with the set credentials.`,
    data: sanitizeUser(newAdmin),
  });
});

/**
 * Update administrator details or status (e.g. toggle active/inactive or role)
 */
export const updateAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updater = req.user;
  const { firstName, lastName, phone, role, isActive } = req.body;

  const targetAdmin = await prisma.user.findUnique({ where: { id } });

  if (!targetAdmin || (targetAdmin.role !== 'ADMIN' && targetAdmin.role !== 'SUPER_ADMIN')) {
    throw new AppError('Administrator not found', 404);
  }

  // An admin cannot modify a SUPER_ADMIN unless they are also a SUPER_ADMIN
  if (targetAdmin.role === 'SUPER_ADMIN' && updater.role !== 'SUPER_ADMIN') {
    throw new AppError('Only Super Administrators can modify Super Administrator accounts', 403);
  }

  // Prevent admin from deactivating or demoting themselves
  if (targetAdmin.id === updater.id) {
    if (isActive === false) {
      throw new AppError('You cannot deactivate your own administrator account', 400);
    }
    if (role && role !== updater.role) {
      throw new AppError('You cannot change your own administrator role', 400);
    }
  }

  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = String(firstName).trim();
  if (lastName !== undefined) updateData.lastName = String(lastName).trim();
  if (phone !== undefined) updateData.phone = phone ? String(phone).trim() : null;
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);

  if (role) {
    if (role === 'SUPER_ADMIN' && updater.role !== 'SUPER_ADMIN') {
      throw new AppError('Only Super Administrators can assign the Super Administrator role', 403);
    }
    updateData.role = role;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  logger.info(`[AdminMgmt] Admin "${updater.email}" updated admin "${updated.email}"`);

  res.json({
    success: true,
    message: 'Administrator updated successfully',
    data: sanitizeUser(updated),
  });
});

/**
 * Reset an administrator's password directly (by logged-in admin)
 */
export const resetAdminPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updater = req.user;
  const { newPassword } = req.body;

  if (!newPassword || String(newPassword).length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400);
  }

  const targetAdmin = await prisma.user.findUnique({ where: { id } });

  if (!targetAdmin || (targetAdmin.role !== 'ADMIN' && targetAdmin.role !== 'SUPER_ADMIN')) {
    throw new AppError('Administrator not found', 404);
  }

  if (targetAdmin.role === 'SUPER_ADMIN' && updater.role !== 'SUPER_ADMIN' && targetAdmin.id !== updater.id) {
    throw new AppError('Only Super Administrators can reset Super Administrator passwords', 403);
  }

  const hashedPassword = await hashPassword(String(newPassword));

  await prisma.user.update({
    where: { id },
    data: {
      password: hashedPassword,
      refreshToken: null, // Invalidate current session for security
    },
  });

  logger.info(`[AdminMgmt] Admin "${updater.email}" reset password for admin "${targetAdmin.email}"`);

  res.json({
    success: true,
    message: `Password reset successfully for administrator "${targetAdmin.email}". They can now log in with the new password.`,
  });
});

/**
 * Remove / Delete an administrator
 */
export const deleteAdmin = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deleter = req.user;

  const targetAdmin = await prisma.user.findUnique({ where: { id } });

  if (!targetAdmin || (targetAdmin.role !== 'ADMIN' && targetAdmin.role !== 'SUPER_ADMIN')) {
    throw new AppError('Administrator not found', 404);
  }

  // Prevent self-deletion
  if (targetAdmin.id === deleter.id) {
    throw new AppError('You cannot delete your own administrator account', 400);
  }

  // Prevent regular ADMIN from deleting SUPER_ADMIN
  if (targetAdmin.role === 'SUPER_ADMIN' && deleter.role !== 'SUPER_ADMIN') {
    throw new AppError('Only Super Administrators can remove Super Administrator accounts', 403);
  }

  // Check if target is the last SUPER_ADMIN
  if (targetAdmin.role === 'SUPER_ADMIN') {
    const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    if (superAdminCount <= 1) {
      throw new AppError('Cannot delete the last Super Administrator account', 400);
    }
  }

  await prisma.user.delete({ where: { id } });

  logger.info(`[AdminMgmt] Admin "${deleter.email}" removed admin "${targetAdmin.email}"`);

  res.json({
    success: true,
    message: `Administrator "${targetAdmin.firstName} ${targetAdmin.lastName}" has been removed`,
  });
});
