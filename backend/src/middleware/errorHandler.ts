import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getDefaultErrorCode(statusCode);
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Returns a standard semantic error code for an HTTP status code
 */
const getDefaultErrorCode = (status: number): string => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'AUTHENTICATION_REQUIRED';
    case 403:
      return 'ACCESS_FORBIDDEN';
    case 404:
      return 'RESOURCE_NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 413:
      return 'PAYLOAD_TOO_LARGE';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 502:
      return 'GATEWAY_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
};

/**
 * Helper to scrub credentials, connection URIs, tokens, or passwords from error strings
 */
const scrubSensitiveInfo = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/mysql:\/\/[^@]+@/gi, 'mysql://***:***@')
    .replace(/postgres:\/\/[^@]+@/gi, 'postgres://***:***@')
    .replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb://***:***@')
    .replace(/bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi, 'Bearer [REDACTED]')
    .replace(/(password|secret|key|token|daraja_key)\s*[:=]\s*['"][^'"]+['"]/gi, '$1: "[REDACTED]"');
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const requestId = req.id || (req.headers['x-request-id'] as string) || 'req_unknown';
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || getDefaultErrorCode(statusCode);
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // 0. CORS Blocked Origin
  if (err && typeof err.message === 'string' && err.message.startsWith('CORS blocked for origin')) {
    statusCode = 403;
    errorCode = 'CORS_FORBIDDEN';
    message = 'Cross-Origin Resource Sharing (CORS) blocked: origin not allowed';
  }

  // 1. Body-parser malformed JSON syntax error
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    statusCode = 400;
    errorCode = 'MALFORMED_JSON';
    message = 'Invalid or malformed JSON payload in request body';
  }

  // 2. Body-parser payload too large
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    statusCode = 413;
    errorCode = 'PAYLOAD_TOO_LARGE';
    message = 'Payload too large: Request body exceeds allowed size limit';
  }

  // 3. Prisma Known Request Errors
  if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    (err && typeof err.code === 'string' && /^P2\d{3}$/.test(err.code))
  ) {
    if (err.code === 'P2002') {
      statusCode = 409;
      errorCode = 'DUPLICATE_ENTRY';
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      message = `A record with this ${target} already exists`;
      details = { conflictFields: err.meta?.target };
    } else if (err.code === 'P2025') {
      statusCode = 404;
      errorCode = 'RESOURCE_NOT_FOUND';
      message = 'The requested database record does not exist';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      errorCode = 'FOREIGN_KEY_VIOLATION';
      message = 'Operation failed due to related record constraint';
    } else if (err.code === 'P2024') {
      statusCode = 503;
      errorCode = 'DATABASE_TIMEOUT';
      message = 'Database connection timed out. Please try again shortly.';
    } else if (err.code === 'P2034') {
      statusCode = 409;
      errorCode = 'TRANSACTION_CONFLICT';
      message = 'Transaction concurrency conflict. Please retry the operation.';
    } else {
      statusCode = 500;
      errorCode = 'DATABASE_ERROR';
      message = 'Database operation failed';
    }
  }

  // 4. Prisma Connection / Initialization Error
  if (
    err instanceof Prisma.PrismaClientInitializationError ||
    err?.name === 'PrismaClientInitializationError'
  ) {
    statusCode = 503;
    errorCode = 'DATABASE_UNAVAILABLE';
    message = 'Database service is currently unreachable';
  }

  // 5. Prisma Validation Error
  if (
    err instanceof Prisma.PrismaClientValidationError ||
    err?.name === 'PrismaClientValidationError'
  ) {
    statusCode = 400;
    errorCode = 'DATABASE_VALIDATION_ERROR';
    message = 'Invalid query parameters or data schema mismatch';
  }

  // 6. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Authentication token is invalid';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Your session has expired. Please log in again.';
  }

  // 7. Express-Validator / Custom Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    if (err.errors && typeof err.errors === 'object') {
      const messages = Object.values(err.errors).map((e: any) => e.message || e);
      message = messages.join(', ');
      details = err.errors;
    }
  }

  // 8. Multer File Upload Errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    errorCode = 'FILE_UPLOAD_ERROR';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded (max allowed: 5MB)';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded in a single request';
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // 9. Scrub message
  const scrubbedMessage = scrubSensitiveInfo(message);

  // 10. Secure Logging: log full stack trace for 500s or unexpected errors
  const logData: Record<string, any> = {
    requestId,
    statusCode,
    errorCode,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
    message: scrubbedMessage,
  };

  if (statusCode >= 500) {
    logData.stack = err.stack;
    logger.error(`[${requestId}] Server Error: ${scrubbedMessage}`, logData);
  } else {
    logger.warn(`[${requestId}] Client Error (${statusCode} ${errorCode}): ${scrubbedMessage}`, logData);
  }

  // 11. Production Masking for 500 Internal Errors
  const isProd = process.env.NODE_ENV === 'production';
  let clientMessage = scrubbedMessage;

  if (isProd && statusCode >= 500 && !err.isOperational) {
    clientMessage = 'An unexpected internal server error occurred. Please contact customer support.';
    details = null;
  }

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    error: {
      code: errorCode,
      message: clientMessage,
      requestId,
      details: isProd && statusCode >= 500 ? null : details,
    },
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `API endpoint ${req.method} ${req.originalUrl} not found`,
    404,
    'RESOURCE_NOT_FOUND'
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

export default {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
};
