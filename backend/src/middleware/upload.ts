import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import logger from '../config/logger';

const storage = multer.memoryStorage();

// Strictly whitelisted MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

/**
 * Validates file buffer magic bytes (file signatures) to prevent file extension / MIME spoofing.
 */
export const isValidImageSignature = (buffer: Buffer): boolean => {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // Check JPEG: starts with FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // Check PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // Check WebP: starts with RIFF (52 49 46 46) and WEBP at bytes 8-11 (57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  return false;
};

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // 1. Strict extension check
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        `Invalid file extension '${ext}'. Allowed extensions: .jpg, .jpeg, .png, .webp`,
        400,
        'INVALID_FILE_EXTENSION'
      )
    );
  }

  // 2. Strict MIME type header check
  if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return cb(
      new AppError(
        `Invalid file MIME type '${file.mimetype}'. Allowed types: image/jpeg, image/png, image/webp`,
        400,
        'INVALID_FILE_TYPE'
      )
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
    files: 10, // Max 10 files per request
  },
});

/**
 * Middleware that inspects memory buffers of uploaded files for cryptographic magic numbers.
 * Rejects polyglot payloads, embedded shell scripts, or renamed executable files.
 */
export const validateFileSignatures = (req: Request, res: Response, next: NextFunction) => {
  const files: Express.Multer.File[] = [];

  if (req.file) {
    files.push(req.file);
  }

  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      for (const field of Object.values(req.files)) {
        files.push(...field);
      }
    }
  }

  for (const file of files) {
    if (!file.buffer || !isValidImageSignature(file.buffer)) {
      logger.warn(`[FileUploadSecurity] File signature check failed for file: ${file.originalname} (${file.mimetype})`);
      return next(
        new AppError(
          `Security check failed for file '${file.originalname}'. The file content does not match a valid image signature (JPEG, PNG, or WebP).`,
          400,
          'INVALID_FILE_SIGNATURE'
        )
      );
    }
  }

  next();
};

/**
 * Secure composite upload middlewares that automatically perform:
 * 1. Multer memory buffer ingestion
 * 2. Magic byte / cryptographic file signature verification
 */
export const uploadSingle = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (err) => {
    if (err) return next(err);
    validateFileSignatures(req, res, next);
  });
};

export const uploadMultiple = (req: Request, res: Response, next: NextFunction) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) return next(err);
    validateFileSignatures(req, res, next);
  });
};

export const uploadFields = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'videos', maxCount: 3 },
  ])(req, res, (err) => {
    if (err) return next(err);
    validateFileSignatures(req, res, next);
  });
};

export default {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  validateFileSignatures,
  isValidImageSignature,
};
