import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sanitizeUser } from '../utils/helpers';

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: sanitizeUser(user),
  });
});

/**
 * Update user profile - with strict field tampering protection.
 * Prevents mass assignment of role, isVerified, email, password, etc.
 */
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { firstName, lastName, phone, avatar } = req.body;

  // Explicitly whitelist only editable profile fields
  const safeData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  } = {};

  if (typeof firstName === 'string' && firstName.trim()) safeData.firstName = firstName.trim();
  if (typeof lastName === 'string' && lastName.trim()) safeData.lastName = lastName.trim();
  if (typeof phone === 'string') safeData.phone = phone.trim();
  if (typeof avatar === 'string') safeData.avatar = avatar.trim();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: safeData,
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: sanitizeUser(updatedUser),
  });
});

/**
 * Get all addresses belonging to the authenticated user
 */
export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });

  res.json({
    success: true,
    data: addresses,
  });
});

/**
 * Create an address strictly scoped to the authenticated user
 */
export const createAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    isDefault,
    type,
  } = req.body;

  if (isDefault) {
    // Unset existing default address
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 ? addressLine2.trim() : null,
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode.trim(),
      isDefault: Boolean(isDefault),
      type: type || 'HOME',
    },
  });

  res.status(201).json({
    success: true,
    message: 'Address created successfully',
    data: address,
  });
});

/**
 * Update address - locks record access by verifying user ownership (IDOR Prevention)
 */
export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const {
    fullName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    country,
    postalCode,
    isDefault,
    type,
  } = req.body;

  // Verify that the address exists and belongs to the authenticated user
  const existingAddress = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found or unauthorized', 404);
  }

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      ...(fullName && { fullName: fullName.trim() }),
      ...(phone && { phone: phone.trim() }),
      ...(addressLine1 && { addressLine1: addressLine1.trim() }),
      addressLine2: addressLine2 !== undefined ? (addressLine2 ? addressLine2.trim() : null) : undefined,
      ...(city && { city: city.trim() }),
      ...(state && { state: state.trim() }),
      ...(country && { country: country.trim() }),
      ...(postalCode && { postalCode: postalCode.trim() }),
      ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
      ...(type && { type }),
    },
  });

  res.json({
    success: true,
    message: 'Address updated successfully',
    data: updatedAddress,
  });
});

/**
 * Delete address - locks record access by verifying user ownership (IDOR Prevention)
 */
export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;

  const existingAddress = await prisma.address.findFirst({
    where: { id, userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found or unauthorized', 404);
  }

  await prisma.address.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Address deleted successfully',
  });
});
