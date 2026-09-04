import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const MAX_DEPTH = 10;
const MAX_TOTAL_KEYS = 1000;

/**
 * Calculates object nesting depth
 */
const getObjectDepth = (obj: any): number => {
  if (obj === null || typeof obj !== 'object') {
    return 0;
  }
  let maxChildDepth = 0;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      maxChildDepth = Math.max(maxChildDepth, getObjectDepth(obj[key]));
    }
  }
  return 1 + maxChildDepth;
};

/**
 * Counts total keys across the payload
 */
const countKeys = (obj: any): number => {
  if (obj === null || typeof obj !== 'object') {
    return 0;
  }
  let count = Object.keys(obj).length;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key]);
    }
  }
  return count;
};

/**
 * Validates payload depth and key count to prevent nesting DoS attacks
 */
export const payloadGuard = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    const depth = getObjectDepth(req.body);
    if (depth > MAX_DEPTH) {
      logger.warn(`[PayloadGuard] Request rejected: nesting depth ${depth} exceeds max of ${MAX_DEPTH}`);
      return res.status(400).json({
        success: false,
        message: 'Bad Request: Payload structure is too deeply nested.',
      });
    }

    const keyCount = countKeys(req.body);
    if (keyCount > MAX_TOTAL_KEYS) {
      logger.warn(`[PayloadGuard] Request rejected: key count ${keyCount} exceeds max of ${MAX_TOTAL_KEYS}`);
      return res.status(400).json({
        success: false,
        message: 'Bad Request: Payload exceeds maximum allowed property count.',
      });
    }
  }

  next();
};

/**
 * Catches body-parser errors (malformed JSON or oversized payload) before they crash the app
 */
export const payloadErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Check for body-parser syntax error (malformed JSON)
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    logger.warn(`[PayloadGuard] Malformed JSON rejected from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid or malformed JSON payload in request body.',
    });
  }

  // Check for body-parser oversized payload (entity.too.large)
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    logger.warn(`[PayloadGuard] Oversized payload rejected from IP ${req.ip} on ${req.method} ${req.originalUrl}`);
    return res.status(413).json({
      success: false,
      message: 'Payload too large: Request body exceeds the allowed size limit.',
    });
  }

  next(err);
};
