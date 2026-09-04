import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import logger from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isCloudinaryConfigured = (): boolean => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  return Boolean(
    name &&
    name !== 'your-cloud-name' &&
    key &&
    key !== 'your-api-key'
  );
};

// Fallback to local server disk storage
const saveLocalImage = async (
  file: Express.Multer.File,
  folder: string = 'laptops'
): Promise<{ url: string; publicId: string }> => {
  const uploadDir = path.join(process.cwd(), 'uploads', folder);
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.originalname) || '.jpg';
  const rawBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${rawBase || 'laptop'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  await fs.promises.writeFile(filePath, file.buffer);
  logger.info(`Saved image locally: /uploads/${folder}/${filename}`);

  return {
    url: `/uploads/${folder}/${filename}`,
    publicId: filename,
  };
};

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'laptops'
): Promise<{ url: string; publicId: string }> => {
  if (!isCloudinaryConfigured()) {
    return saveLocalImage(file, folder);
  }

  try {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `laptop-store/${folder}`,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            logger.warn('Cloudinary upload error, using local storage fallback:', error);
            resolve(saveLocalImage(file, folder));
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    logger.warn('Image upload failed on Cloudinary, falling back to local storage:', error);
    return saveLocalImage(file, folder);
  }
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured()) {
    try {
      const possiblePath = path.join(process.cwd(), 'uploads', 'laptops', publicId);
      if (fs.existsSync(possiblePath)) {
        await fs.promises.unlink(possiblePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    logger.error('Image deletion failed:', error);
    return false;
  }
};

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string = 'laptops'
): Promise<{ url: string; publicId: string }[]> => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Multiple images upload failed:', error);
    throw error;
  }
};

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'blog'
): Promise<{ secure_url: string; public_id: string }> => {
  const file: Express.Multer.File = {
    buffer,
    originalname: `image-${Date.now()}.jpg`,
    mimetype: 'image/jpeg',
    fieldname: 'image',
    encoding: '7bit',
    size: buffer.length,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };
  const res = await uploadImage(file, folder);
  return {
    secure_url: res.url,
    public_id: res.publicId,
  };
};

export default cloudinary;
