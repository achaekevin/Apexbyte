import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import redis from '../config/redis';
import logger from '../config/logger';

// Standard general API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive resource operations
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createOrderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many order attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many reviews submitted, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 40,
  message: {
    success: false,
    message: 'Too many search requests, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// =========================================================================
// MANDATORY REQUIREMENT 11: Unified Shared Authentication Rate Limiter
// Maximum 5 attempts per 15 minutes across ALL authentication endpoints
// Distributed Redis storage with atomic in-memory sliding-window fallback
// =========================================================================

const AUTH_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const AUTH_WINDOW_SEC = Math.ceil(AUTH_WINDOW_MS / 1000); // 900 seconds
const AUTH_MAX_ATTEMPTS = 5; // Exactly 5 attempts allowed

interface MemoryRecord {
  count: number;
  resetTime: number; // timestamp in ms
}

// In-memory fallback cache
const inMemoryStore = new Map<string, MemoryRecord>();

// Periodic cleanup of expired in-memory records (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryStore.entries()) {
    if (record.resetTime <= now) {
      inMemoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

/**
 * Extracts a normalized client IP address
 */
const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip = raw.split(',')[0].trim();
    if (ip) return ip;
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * Unified Shared Authentication Rate Limiter Middleware
 * Shared across /login, /register, /forgot-password, /reset-password, /verify-email,
 * /resend-verification, /refresh-token, and /change-password
 */
export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  // In development mode, bypass the strict 5-attempt limit so local developer testing is not locked out
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const redisKey = `auth_limiter:ip:${ip}`;

  let attempts = 0;
  let ttlSeconds = AUTH_WINDOW_SEC;

  let redisAvailable = false;
  if (redis && redis.status === 'ready') {
    try {
      // Atomic increment in Redis
      const current = await redis.incr(redisKey);
      if (current === 1) {
        await redis.expire(redisKey, AUTH_WINDOW_SEC);
      }
      const ttl = await redis.ttl(redisKey);
      ttlSeconds = ttl > 0 ? ttl : AUTH_WINDOW_SEC;
      attempts = current;
      redisAvailable = true;
    } catch (err) {
      logger.warn('[AuthLimiter] Redis error, switching to in-memory fallback:', err);
      redisAvailable = false;
    }
  }

  // Fallback to in-memory sliding window store if Redis is unavailable
  if (!redisAvailable) {
    const record = inMemoryStore.get(ip);
    if (!record || record.resetTime <= now) {
      // First attempt in this window
      attempts = 1;
      inMemoryStore.set(ip, {
        count: 1,
        resetTime: now + AUTH_WINDOW_MS,
      });
      ttlSeconds = AUTH_WINDOW_SEC;
    } else {
      record.count += 1;
      attempts = record.count;
      ttlSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    }
  }

  const remaining = Math.max(0, AUTH_MAX_ATTEMPTS - attempts);

  // Standard rate limit response headers (RFC 6585 & Draft RFC standard headers)
  res.setHeader('RateLimit-Limit', AUTH_MAX_ATTEMPTS.toString());
  res.setHeader('RateLimit-Remaining', remaining.toString());
  res.setHeader('RateLimit-Reset', ttlSeconds.toString());

  if (attempts > AUTH_MAX_ATTEMPTS) {
    res.setHeader('Retry-After', ttlSeconds.toString());
    const requestId = req.id || (req.headers['x-request-id'] as string) || 'req_auth_limit';

    logger.warn(`[AuthLimiter] Authentication rate limit exceeded for IP: ${ip} on ${req.method} ${req.originalUrl}. Attempts: ${attempts}`);

    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts. Please try again after 15 minutes.',
        retryAfter: ttlSeconds,
        requestId,
      },
    });
  }

  next();
};

// Aliases for compatibility across existing route imports
export const authLimiter = authRateLimiter;
