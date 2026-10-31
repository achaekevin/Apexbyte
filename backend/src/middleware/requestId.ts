import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Attaches a unique, traceable Request ID to every HTTP request.
 * If the client sends a trusted X-Request-Id header (alphanumeric/hyphens, <= 64 chars),
 * it is sanitized and reused. Otherwise, a secure UUID v4 is generated.
 * The ID is exposed on the response header 'X-Request-Id' for end-to-end correlation.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incomingId = req.headers['x-request-id'];
  let validId: string | null = null;

  if (typeof incomingId === 'string') {
    const trimmed = incomingId.trim();
    if (/^[a-zA-Z0-9\-_]{8,64}$/.test(trimmed)) {
      validId = trimmed;
    }
  }

  const requestId = validId || `req_${uuidv4().replace(/-/g, '')}`;

  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  next();
};

export default requestIdMiddleware;

