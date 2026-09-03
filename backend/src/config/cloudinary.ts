import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'laptops'
): Promise<{ url: string; publicId: string }> => {
  try {
    return new Promise((resolve, reject) => {
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
            logger.error('Cloudinary upload error:', error);
            reject(error);
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
    logger.error('Image upload failed:', error);
    throw error;
  }
};

export const deleteImage = async (publicId: string): Promise<boolean> => {
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

export default cloudinary;
