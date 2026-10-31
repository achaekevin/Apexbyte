import { describe, it, expect, jest } from '@jest/globals';
import { requestIdMiddleware } from '../middleware/requestId';
import { errorHandler, notFound, AppError } from '../middleware/errorHandler';

describe('Error Handling and Request ID System', () => {
  const createMockReqRes = (overrides: Record<string, any> = {}) => {
    const req: any = {
      headers: {},
      method: 'GET',
      originalUrl: '/api/v1/laptops',
      ...overrides,
    };

    const res: any = {
      statusCode: 200,
      headersSent: false,
      headers: {} as Record<string, string>,
      status: jest.fn(function (this: any, code: number) {
        this.statusCode = code;
        return this;
      }),
      json: jest.fn(function (this: any, data: any) {
        this.body = data;
        return this;
      }),
      setHeader: jest.fn(function (this: any, name: string, value: string) {
        this.headers[name.toLowerCase()] = value;
      }),
    };

    const next = jest.fn();

    return { req, res, next };
  };

  describe('Request ID Correlation Middleware', () => {
    it('generates a new UUID v4 request ID when no X-Request-Id is incoming', () => {
      const { req, res, next } = createMockReqRes();
      requestIdMiddleware(req, res, next);

      expect(req.id).toBeDefined();
      expect(typeof req.id).toBe('string');
      expect(req.id.length).toBeGreaterThan(10);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);
      expect(next).toHaveBeenCalled();
    });

    it('propagates and preserves client-provided X-Request-Id header', () => {
      const incomingId = 'client-trace-custom-9988';
      const { req, res, next } = createMockReqRes({
        headers: { 'x-request-id': incomingId },
      });
      requestIdMiddleware(req, res, next);

      expect(req.id).toBe(incomingId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', incomingId);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Centralized Express Error Handler', () => {
    it('formats custom AppError correctly with code, message, and details', () => {
      const { req, res, next } = createMockReqRes({ id: 'req-test-123' });
      const err = new AppError('Laptop model is out of stock', 400, 'OUT_OF_STOCK', {
        sku: 'DEL-XPS15-2024',
      });

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Laptop model is out of stock');
      expect(res.body.error).toEqual({
        code: 'OUT_OF_STOCK',
        message: 'Laptop model is out of stock',
        requestId: 'req-test-123',
        details: { sku: 'DEL-XPS15-2024' },
      });
    });

    it('maps Prisma P2002 duplicate key constraint to 409 DUPLICATE_ENTRY', () => {
      const { req, res, next } = createMockReqRes({ id: 'req-dup-456' });
      const err: any = new Error('Unique constraint failed on the constraint: `users_email_key`');
      err.code = 'P2002';
      err.meta = { target: ['email'] };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(res.body.error.details.conflictFields).toEqual(['email']);
      expect(res.body.error.requestId).toBe('req-dup-456');
    });

    it('maps Prisma P2025 record not found to 404 RESOURCE_NOT_FOUND', () => {
      const { req, res, next } = createMockReqRes({ id: 'req-notfound-789' });
      const err: any = new Error('An operation failed because it depends on one or more records that were required but not found.');
      err.code = 'P2025';

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
      expect(res.body.error.requestId).toBe('req-notfound-789');
    });

    it('handles notFound route middleware and passes 404 AppError to next()', () => {
      const { req, res, next } = createMockReqRes({
        method: 'POST',
        originalUrl: '/api/v1/invalid-route',
      });

      notFound(req, res, next);

      expect(next).toHaveBeenCalled();
      const passedError = (next as any).mock.calls[0][0];
      expect(passedError).toBeInstanceOf(AppError);
      expect(passedError.statusCode).toBe(404);
      expect(passedError.code).toBe('RESOURCE_NOT_FOUND');
      expect(passedError.message).toBe('API endpoint POST /api/v1/invalid-route not found');
    });

    it('sanitizes unexpected 500 exceptions in production mode to avoid leaking internals', () => {
      const origEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const { req, res, next } = createMockReqRes({ id: 'req-prod-sec-500' });
        const secretError = new Error('psql: password authentication failed for user "postgres"');

        errorHandler(secretError, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body.success).toBe(false);
        // Sensitive error message must not be leaked to the client
        expect(res.body.message).not.toContain('password authentication');
        expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
        expect(res.body.error.details).toBeNull();
        expect(res.body.error.requestId).toBe('req-prod-sec-500');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });
  });
});
