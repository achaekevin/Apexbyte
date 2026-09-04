import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper to scrub credentials, tokens, or sensitive patterns from error strings
const scrubSensitiveInfo = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/mysql:\/\/[^@]+@/gi, 'mysql://***:***@')
    .replace(/postgres:\/\/[^@]+@/gi, 'postgres://***:***@')
    .replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb://***:***@')
    .replace(/bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer [REDACTED]')
    .replace(/(password|secret|key|token)\s*[:=]\s*['"][^'"]+['"]/gi, '$1: "[REDACTED]"');
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Body-parser malformed JSON
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    error = new AppError('Invalid or malformed JSON payload in request body', 400);
  }

  // Body-parser payload too large
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    error = new AppError('Payload too large: Request body exceeds the allowed size limit', 413);
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      error = new AppError(`${field} already exists`, 400);
    } else if (err.code === 'P2025') {
      error = new AppError('Record not found', 404);
    } else if (err.code === 'P2003') {
      error = new AppError('Foreign key constraint failed', 400);
    } else {
      error = new AppError('Database error occurred', 500);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new AppError('Invalid data provided', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    error = new AppError(messages.join(', '), 400);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new AppError('File too large', 400);
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new AppError('Too many files', 400);
    } else {
      error = new AppError('File upload error', 400);
    }
  }

  // Log error with scrubbed credentials
  logger.error({
    message: scrubSensitiveInfo(err.message || ''),
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const statusCode = error.statusCode || err.statusCode || 500;
  const rawMessage = error.message || 'Internal server error';
  const cleanMessage = scrubSensitiveInfo(rawMessage);

  res.status(statusCode).json({
    success: false,
    message: cleanMessage,
    ...(process.env.NODE_ENV === 'development' && statusCode !== 500 && {
      details: cleanMessage,
    }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
