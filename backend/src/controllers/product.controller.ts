import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { uploadImage, uploadMultipleImages } from '../config/cloudinary';
import { generateSlug, getPagination, getPaginationMeta } from '../utils/helpers';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';

// Get all products with filtering, sorting, and pagination
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    brandId,
    categoryId,
    minPrice,
    maxPrice,
    ram,
    storage,
    processorBrand,
    sortBy = 'createdAt',
    order = 'desc',
    isFeatured,
    isNewArrival,
    isBestSeller,
  } = req.query;

  const cacheKey = `products:${JSON.stringify(req.query)}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { skip, take } = getPagination(Number(page), Number(limit));

  const where: any = {
    status: 'PUBLISHED',
  };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  if (brandId) where.brandId = brandId as string;
  if (categoryId) where.categoryId = categoryId as string;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (ram) {
    const ramValues = Array.isArray(ram) ? ram.map(Number) : [Number(ram)];
    where.ram = { in: ramValues };
  }

  if (storage) {
    const storageValues = Array.isArray(storage) ? storage.map(Number) : [Number(storage)];
    where.storage = { in: storageValues };
  }

  if (processorBrand) {
    const brands = Array.isArray(processorBrand) ? processorBrand : [processorBrand];
    where.processorBrand = { in: brands };
  }

  if (isFeatured === 'true') where.isFeatured = true;
  if (isNewArrival === 'true') where.isNewArrival = true;
  if (isBestSeller === 'true') where.isBestSeller = true;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { order: 'asc' } },
        brand: true,
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      skip,
      take,
      orderBy: { [sortBy as string]: order },
    }),
    prisma.product.count({ where }),
  ]);

  const productsWithRatings = products.map((product) => {
    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    return {
      ...product,
      reviews: undefined,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    };
  });

  const response = {
    success: true,
    data: productsWithRatings,
    pagination: getPaginationMeta(total, Number(page), Number(limit)),
  };

  await cacheSet(cacheKey, response, 300); // Cache for 5 minutes

  res.json(response);
});

// Get single product by ID
export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const cacheKey = `product:${id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      brand: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Increment view count
  await prisma.product.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const response = {
    success: true,
    data: {
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    },
  };

  await cacheSet(cacheKey, response, 600); // Cache for 10 minutes

  res.json(response);
});

// Get product by slug
export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: 'asc' } },
      videos: { orderBy: { order: 'asc' } },
      brand: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Increment view count
  await prisma.product.update({
    where: { id: product.id },
    data: { viewCount: { increment: 1 } },
  });

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  res.json({
    success: true,
    data: {
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    },
  });
});

// Get related products
export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    select: { categoryId: true, brandId: true, price: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: id },
      status: 'PUBLISHED',
      OR: [
        { categoryId: product.categoryId },
        { brandId: product.brandId },
        {
          price: {
            gte: Number(product.price) * 0.8,
            lte: Number(product.price) * 1.2,
          },
        },
      ],
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      brand: true,
    },
    take: 8,
  });

  res.json({
    success: true,
    data: relatedProducts,
  });
});

// Create product (Admin)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = req.body;

  // Generate slug
  data.slug = generateSlug(data.name);

  // Check if slug exists
  const existing = await prisma.product.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    data.slug = `${data.slug}-${Date.now()}`;
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      price: Number(data.price),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
      costPrice: data.costPrice ? Number(data.costPrice) : null,
      discount: data.discount ? Number(data.discount) : 0,
      stock: Number(data.stock),
      ram: Number(data.ram),
      storage: Number(data.storage),
      displaySize: Number(data.displaySize),
      refreshRate: data.refreshRate ? Number(data.refreshRate) : null,
      gpuMemory: data.gpuMemory ? Number(data.gpuMemory) : null,
    },
    include: {
      brand: true,
      category: true,
    },
  });

  // Clear cache
  await cacheDel('products:*');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

// Update product (Admin)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Update slug if name changed
  if (data.name && data.name !== product.name) {
    data.slug = generateSlug(data.name);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...data,
      price: data.price ? Number(data.price) : undefined,
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
      stock: data.stock ? Number(data.stock) : undefined,
      ram: data.ram ? Number(data.ram) : undefined,
      storage: data.storage ? Number(data.storage) : undefined,
    },
    include: {
      brand: true,
      category: true,
      images: true,
    },
  });

  // Clear cache
  await cacheDel(`product:${id}`);
  await cacheDel('products:*');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updated,
  });
});

// Delete product (Admin)
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await prisma.product.delete({ where: { id } });

  // Clear cache
  await cacheDel(`product:${id}`);
  await cacheDel('products:*');

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Upload product images (Admin)
export const uploadProductImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No images provided', 400);
    }

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    const uploadedImages = await uploadMultipleImages(files, 'products');

    const images = await Promise.all(
      uploadedImages.map((img, index) =>
        prisma.productImage.create({
          data: {
            productId: id,
            url: img.url,
            alt: product.name,
            order: index,
            isMain: index === 0,
          },
        })
      )
    );

    // Clear cache
    await cacheDel(`product:${id}`);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: images,
    });
  }
);

// Get filters data
export const getFiltersData = asyncHandler(async (req: Request, res: Response) => {
  const [brands, categories, priceRange, ramOptions, storageOptions] = await Promise.all([
    prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: true },
      orderBy: { order: 'asc' },
    }),
    prisma.product.aggregate({
      where: { status: 'PUBLISHED' },
      _min: { price: true },
      _max: { price: true },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      distinct: ['ram'],
      select: { ram: true },
      orderBy: { ram: 'asc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      distinct: ['storage'],
      select: { storage: true },
      orderBy: { storage: 'asc' },
    }),
  ]);

  res.json({
    success: true,
    data: {
      brands,
      categories,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 5000,
      },
      ramOptions: ramOptions.map((r) => r.ram),
      storageOptions: storageOptions.map((s) => s.storage),
      processorBrands: ['INTEL', 'AMD', 'APPLE'],
    },
  });
});
