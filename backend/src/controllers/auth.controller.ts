import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';
import {
  hashPassword,
  comparePassword,
  sanitizeUser,
  isStrongPassword,
} from '../utils/helpers';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  generateResetToken,
} from '../utils/jwt';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../config/email';
import { AuthRequest } from '../middleware/auth';

// Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    throw new AppError(
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
      400
    );
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      verificationToken,
    },
  });

  // Send verification email
  await sendVerificationEmail(email, verificationToken, firstName);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    data: {
      user: sanitizeUser(user),
    },
  });
});

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated', 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Update user with refresh token and last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLogin: new Date(),
    },
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    },
  });
});

// Refresh token
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Update refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  }
);

// Logout
export const logout = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
);

// Verify email
export const verifyEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  }
);

// Resend verification email
export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const verificationToken = generateVerificationToken();

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await sendVerificationEmail(email, verificationToken, user.firstName);

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  }
);

// Forgot password
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    await sendPasswordResetEmail(email, resetToken, user.firstName);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent',
    });
  }
);

// Reset password
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      throw new AppError(
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
        400
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  }
);

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: true,
        cart: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isMain: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: {
                      where: { isMain: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
      },
    });
  }
);

// Change password
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Validate new password strength
    if (!isStrongPassword(newPassword)) {
      throw new AppError(
        'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
        400
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  }
);
