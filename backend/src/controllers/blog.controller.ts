import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../config/cloudinary';
import { generateSlug } from '../utils/helpers';

// Blog Posts
export const getPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    page = 1,
    limit = 10,
    categoryId,
    status,
    search,
    featured,
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (categoryId) where.categoryId = String(categoryId);
  if (status) where.status = String(status);
  if (featured !== undefined) where.isFeatured = featured === 'true';
  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { content: { contains: String(search) } },
    ];
  }

  const [posts, total, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.blogPost.count({ where }),
    prisma.blogCategory.findMany(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  // Fetch authors
  const authorIds = Array.from(new Set(posts.map((p) => p.authorId).filter(Boolean))) as string[];
  const users = authorIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, firstName: true, lastName: true, avatar: true },
      })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const enrichedPosts = posts.map((post) => ({
    ...post,
    views: post.viewCount || 0,
    category: post.categoryId ? catMap.get(post.categoryId) || null : null,
    author: (post.authorId && userMap.get(post.authorId)) || {
      id: 'admin',
      firstName: 'Apexbyte',
      lastName: 'Editorial',
      avatar: null,
    },
    _count: { comments: 0 },
  }));

  res.json({
    success: true,
    data: enrichedPosts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getPost = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { slug } = req.params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  // Increment viewCount safely
  await prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  let category = null;
  if (post.categoryId) {
    category = await prisma.blogCategory.findUnique({ where: { id: post.categoryId } });
  }

  let author = {
    id: 'admin',
    firstName: 'Apexbyte',
    lastName: 'Editorial',
    avatar: null,
  };
  if (post.authorId) {
    const user = await prisma.user.findUnique({
      where: { id: post.authorId },
      select: { id: true, firstName: true, lastName: true, avatar: true },
    });
    if (user) author = user as any;
  }

  // Fetch approved comments
  const comments = await prisma.blogComment
    .findMany({
      where: { postId: post.id, isApproved: true },
      orderBy: { createdAt: 'desc' },
    })
    .catch(() => []);

  res.json({
    success: true,
    data: {
      ...post,
      views: (post.viewCount || 0) + 1,
      category,
      author,
      comments,
      _count: { comments: comments.length },
    },
  });
});

export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags,
      metaTitle,
      metaDescription,
      isFeatured,
      status = 'DRAFT',
    } = req.body;

    let slug = generateSlug(title);
    
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });

    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    let featuredImage = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blog');
      featuredImage = result.secure_url;
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        categoryId,
        authorId: req.user!.id,
        keywords: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined,
        metaTitle,
        metaDescription,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: post,
    });
  }
);

export const updatePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      categoryId,
      tags,
      metaTitle,
      metaDescription,
      isFeatured,
      status,
    } = req.body;

    const post = await prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    let slug = post.slug;
    if (title && title !== post.title) {
      slug = generateSlug(title);
      const existingPost = await prisma.blogPost.findUnique({
        where: { slug },
      });
      if (existingPost && existingPost.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    let featuredImage = post.featuredImage;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blog');
      featuredImage = result.secure_url;
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        categoryId,
        keywords: tags ? (typeof tags === 'string' ? tags : JSON.stringify(tags)) : undefined,
        metaTitle,
        metaDescription,
        status,
        publishedAt:
          status === 'PUBLISHED' && !post.publishedAt ? new Date() : undefined,
      },
      include: {
        category: true,
      },
    });

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedPost,
    });
  }
);

export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({ where: { id } });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    await prisma.blogPost.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Blog post deleted successfully',
    });
  }
);

// Blog Categories
export const getCategories = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });

    // Safely aggregate posts count per category
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { categoryId: true },
    });
    const countMap: Record<string, number> = {};
    posts.forEach((p) => {
      if (p.categoryId) {
        countMap[p.categoryId] = (countMap[p.categoryId] || 0) + 1;
      }
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat,
      _count: {
        posts: countMap[cat.id] || 0,
      },
    }));

    res.json({
      success: true,
      data: enrichedCategories,
    });
  }
);

export const createCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;

    const slug = generateSlug(name);

    const existing = await prisma.blogCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new AppError('Category with this name already exists', 400);
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  }
);

export const updateCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await prisma.blogCategory.findUnique({ where: { id } });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    let slug = category.slug;
    if (name && name !== category.name) {
      slug = generateSlug(name);
      const existing = await prisma.blogCategory.findUnique({
        where: { slug },
      });
      if (existing && existing.id !== id) {
        throw new AppError('Category with this name already exists', 400);
      }
    }

    const updated = await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  }
);

export const deleteCategory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const category = await prisma.blogCategory.findUnique({ where: { id } });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const postsCount = await prisma.blogPost.count({
      where: { categoryId: id },
    });

    if (postsCount > 0) {
      throw new AppError(
        'Cannot delete category with existing posts. Reassign posts first.',
        400
      );
    }

    await prisma.blogCategory.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
);

// Blog Comments
export const getComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, postId, isApproved } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (postId) where.postId = String(postId);
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';

    const [comments, total] = await Promise.all([
      prisma.blogComment.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.blogComment.count({ where }),
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const createComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { postId, content } = req.body;

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    if (post.status !== 'PUBLISHED') {
      throw new AppError('Cannot comment on unpublished posts', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    const comment = await prisma.blogComment.create({
      data: {
        postId,
        userId: req.user!.id,
        name: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        email: user?.email || 'customer@apexbyte.co.ke',
        comment: content || req.body.comment || '',
        isApproved: false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Comment submitted and awaiting approval',
      data: comment,
    });
  }
);

export const approveComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const comment = await prisma.blogComment.findUnique({ where: { id } });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const updated = await prisma.blogComment.update({
      where: { id },
      data: { isApproved: true },
    });

    res.json({
      success: true,
      message: 'Comment approved successfully',
      data: updated,
    });
  }
);

export const deleteComment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const comment = await prisma.blogComment.findUnique({ where: { id } });

    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    await prisma.blogComment.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  }
);
