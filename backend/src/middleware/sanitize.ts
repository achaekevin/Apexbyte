import { Request, Response, NextFunction } from 'express';

// Fields that should not have their characters stripped (like passwords containing symbols)
const EXCLUDED_FIELDS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
]);

// Strip dangerous script tags, html injections, and event handlers
const sanitizeString = (str: string): string => {
  if (!str) return str;

  return str
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe, embed, object tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove inline event handlers (onerror, onclick, onload, etc.)
    .replace(/\s*on\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '')
    // Remove javascript: pseudoprotocol
    .replace(/javascript:[^"']*/gi, '')
    // Remove data:text/html
    .replace(/data:text\/html[^"']*/gi, '')
    // Trim leading and trailing whitespace
    .trim();
};

/**
 * Deep recursive object sanitizer
 */
const deepSanitize = (data: any, parentKey?: string): any => {
  if (data === null || data === undefined) {
    return data;
  }

  // Sanitize strings
  if (typeof data === 'string') {
    if (parentKey && EXCLUDED_FIELDS.has(parentKey)) {
      // For passwords, only strip null bytes to prevent injection, preserve special characters
      return data.replace(/\0/g, '');
    }
    return sanitizeString(data);
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    return data.map((item) => deepSanitize(item, parentKey));
  }

  // Handle Objects
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }

      const cleanKey = key.replace(/\0/g, '').trim();
      cleaned[cleanKey] = deepSanitize(value, cleanKey);
    }

    return cleaned;
  }

  return data;
};

/**
 * Middleware to sanitize all incoming user inputs across body, query, and params.
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = deepSanitize(req.params);
  }

  next();
};

export default sanitizeInput;
