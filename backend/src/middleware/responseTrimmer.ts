import { Request, Response, NextFunction } from 'express';

const SENSITIVE_RESPONSE_KEYS = new Set([
  'password',
  'refreshtoken',
  'resettoken',
  'verificationtoken',
  'temppassword',
  'webhooksecret',
  'apisecret',
  'apikey',
  'jwtsecret',
  'stripesecretkey',
  'dbpassword',
]);

/**
 * Deep recursive response cleaner to strip sensitive keys from outbound JSON
 */
const cleanResponseData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(cleanResponseData);
  }

  if (typeof data === 'object') {
    // Preserve Date and Buffer instances
    if (data instanceof Date || Buffer.isBuffer(data)) {
      return data;
    }

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_RESPONSE_KEYS.has(key.toLowerCase())) {
        continue; // Omit sensitive field completely
      }
      cleaned[key] = cleanResponseData(value);
    }
    return cleaned;
  }

  return data;
};

/**
 * Intercepts res.json to automatically sanitize outbound responses
 */
export const responseTrimmer = (_req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);

  res.json = function (body: any): Response {
    if (body && typeof body === 'object') {
      const sanitizedBody = cleanResponseData(body);
      return originalJson(sanitizedBody);
    }
    return originalJson(body);
  };

  next();
};

export default responseTrimmer;
