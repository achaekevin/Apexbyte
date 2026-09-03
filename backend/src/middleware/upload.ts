import multer from 'multer';
import { Request } from 'express';
import { AppError } from './errorHandler';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,image/jpg')
    .split(',');

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
        400
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);
export const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 },
]);
