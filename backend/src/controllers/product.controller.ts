import { Request, Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { uploadImage, uploadMultipleImages } from '../config/cloudinary';
import { generateSlug, getPagination, getPaginationMeta } from '../utils/helpers';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';

export const formatProductImages = (product: any) => {
  if (!product) return product;
  const images = Array.isArray(product.images)
    ? product.images.map((img: any) => (typeof img === 'string' ? img : img.url))
    : [];
  return {
    ...product,
    images,
    imageObjects: product.images,
  };
};

// Get all products with filtering, sorting, and pagination
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    search,
    brandId,
    brand,
    categoryId,
    category,
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

  const targetBrand = (brandId || brand) as string;
  if (targetBrand) {
    where.brand = {
      OR: [
        { id: targetBrand },
        { slug: targetBrand },
        { name: targetBrand },
      ],
    };
  }

  const targetCategory = (categoryId || category) as string;
  if (targetCategory) {
    where.category = {
      OR: [
        { id: targetCategory },
        { slug: targetCategory },
        { name: targetCategory },
      ],
    };
  }

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

    return formatProductImages({
      ...product,
      reviews: undefined,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    });
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

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
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

  const response = {
    success: true,
    data: formatProductImages({
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    }),
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
    data: formatProductImages({
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    }),
  });
});

// Get related products
export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    select: { id: true, categoryId: true, brandId: true, price: true },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: product.id },
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
    data: relatedProducts.map(formatProductImages),
  });
});

// Create product (Admin)
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    images,
    imageObjects,
    brand,
    category,
    reviews,
    image,
    ...data
  } = req.body;

  // Generate slug
  data.slug = data.slug || generateSlug(data.name);

  // Check if slug exists
  const existing = await prisma.product.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    data.slug = `${data.slug}-${Date.now()}`;
  }

  if (!data.sku) {
    data.sku = `LAP-${Date.now().toString().slice(-6)}`;
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      price: Number(data.price),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
      costPrice: data.costPrice ? Number(data.costPrice) : null,
      discount: data.discount ? Number(data.discount) : 0,
      stock: Number(data.stock || 0),
      ram: Number(data.ram || 8),
      storage: Number(data.storage || 256),
      displaySize: Number(data.displaySize || 14),
      refreshRate: data.refreshRate ? Number(data.refreshRate) : null,
      gpuMemory: data.gpuMemory ? Number(data.gpuMemory) : null,
    },
    include: {
      brand: true,
      category: true,
    },
  });

  // Handle images if provided
  const imageList: string[] = [];
  if (Array.isArray(images) && images.length > 0) {
    images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) imageList.push(url);
    });
  } else if (typeof image === 'string' && image) {
    imageList.push(image);
  }

  if (imageList.length > 0) {
    await prisma.productImage.createMany({
      data: imageList.map((url: string, index: number) => ({
        productId: product.id,
        url,
        alt: `${product.name} - Image ${index + 1}`,
        order: index,
        isMain: index === 0,
      })),
    });
  }

  // Clear cache
  await cacheDel('products:*');

  const fullProduct = await prisma.product.findUnique({
    where: { id: product.id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: formatProductImages(fullProduct),
  });
});

// Update product (Admin)
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    images,
    imageObjects,
    brand,
    category,
    reviews,
    image,
    ...data
  } = req.body;

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
      price: data.price !== undefined ? Number(data.price) : undefined,
      compareAtPrice: data.compareAtPrice !== undefined ? (data.compareAtPrice ? Number(data.compareAtPrice) : null) : undefined,
      costPrice: data.costPrice !== undefined ? (data.costPrice ? Number(data.costPrice) : null) : undefined,
      discount: data.discount !== undefined ? Number(data.discount) : undefined,
      stock: data.stock !== undefined ? Number(data.stock) : undefined,
      ram: data.ram !== undefined ? Number(data.ram) : undefined,
      storage: data.storage !== undefined ? Number(data.storage) : undefined,
      displaySize: data.displaySize !== undefined ? Number(data.displaySize) : undefined,
      refreshRate: data.refreshRate !== undefined ? (data.refreshRate ? Number(data.refreshRate) : null) : undefined,
      gpuMemory: data.gpuMemory !== undefined ? (data.gpuMemory ? Number(data.gpuMemory) : null) : undefined,
    },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  // If images array is provided, replace images
  if (images && Array.isArray(images) && images.length > 0) {
    const imageList: string[] = [];
    images.forEach((img) => {
      const url = typeof img === 'string' ? img : img?.url;
      if (url) imageList.push(url);
    });

    if (imageList.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: imageList.map((url: string, index: number) => ({
          productId: id,
          url,
          alt: `${updated.name} - Image ${index + 1}`,
          order: index,
          isMain: index === 0,
        })),
      });
    }
  }

  // Clear cache
  await cacheDel(`product:${id}`);
  await cacheDel('products:*');

  const fullProduct = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: formatProductImages(fullProduct),
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

// Upload product images generally (Admin)
export const uploadGeneralProductImages = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError('No images provided', 400);
    }

    const uploadedImages = await uploadMultipleImages(files, 'products');

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: uploadedImages.map((img) => img.url),
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
