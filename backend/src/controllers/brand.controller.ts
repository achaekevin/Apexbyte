import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { generateSlug } from '../utils/helpers';
import { uploadImage } from '../config/cloudinary';

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  res.json({
    success: true,
    data: brands,
  });
});

export const getBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      products: {
        where: { status: 'PUBLISHED' },
        include: {
          images: { where: { isMain: true }, take: 1 },
        },
        take: 12,
      },
    },
  });

  if (!brand) {
    throw new AppError('Brand not found', 404);
  }

  res.json({
    success: true,
    data: brand,
  });
});

export const createBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, website } = req.body;

  const slug = generateSlug(name);

  const existing = await prisma.brand.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError('Brand already exists', 400);
  }

  let logoUrl: string | undefined;
  if (req.file) {
    const uploaded = await uploadImage(req.file, 'brands');
    logoUrl = uploaded.url;
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug,
      description,
      website,
      logo: logoUrl,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Brand created successfully',
    data: brand,
  });
});

export const updateBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, website, isActive } = req.body;

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) {
    throw new AppError('Brand not found', 404);
  }

  let logoUrl = brand.logo;
  if (req.file) {
    const uploaded = await uploadImage(req.file, 'brands');
    logoUrl = uploaded.url;
  }

  const updated = await prisma.brand.update({
    where: { id },
    data: {
      name: name || brand.name,
      slug: name ? generateSlug(name) : brand.slug,
      description,
      website,
      logo: logoUrl,
      isActive,
    },
  });

  res.json({
    success: true,
    message: 'Brand updated successfully',
    data: updated,
  });
});

export const deleteBrand = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!brand) {
    throw new AppError('Brand not found', 404);
  }

  if (brand._count.products > 0) {
    throw new AppError('Cannot delete brand with existing products', 400);
  }

  await prisma.brand.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Brand deleted successfully',
  });
});
