import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: any;
}

const formatAuthError = (req: Request, statusCode: number, code: string, message: string) => {
  const requestId = req.id || (req.headers['x-request-id'] as string) || 'req_auth';
  return {
    success: false,
    message,
    error: {
      code,
      message,
      requestId,
      details: null,
    },
  };
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json(
        formatAuthError(req, 401, 'AUTHENTICATION_REQUIRED', 'Access denied. No authentication token provided.')
      );
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res.status(401).json(
        formatAuthError(req, 401, 'USER_NOT_FOUND', 'Invalid token. User account could not be found.')
      );
    }

    if (!user.isActive) {
      return res.status(401).json(
        formatAuthError(req, 401, 'ACCOUNT_DEACTIVATED', 'Your account has been deactivated. Contact support.')
      );
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        formatAuthError(req, 401, 'TOKEN_EXPIRED', 'Your session has expired. Please log in again.')
      );
    }

    return res.status(401).json(
      formatAuthError(req, 401, 'INVALID_TOKEN', 'Invalid or corrupted authentication token.')
    );
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        formatAuthError(req, 401, 'AUTHENTICATION_REQUIRED', 'Authentication required to access this resource.')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        formatAuthError(req, 403, 'ACCESS_FORBIDDEN', 'Access denied. Administrator privileges required.')
      );
    }

    next();
  };
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
        },
      });

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

export const verifyEmailRequired = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.isVerified) {
    return res.status(403).json(
      formatAuthError(req, 403, 'EMAIL_VERIFICATION_REQUIRED', 'Please verify your email address to continue.')
    );
  }
  next();
};

export default {
  authenticate,
  authorize,
  optionalAuth,
  verifyEmailRequired,
};
