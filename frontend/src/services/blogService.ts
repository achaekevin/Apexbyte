import api from './api';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string | null;
  categoryId: string;
  authorId: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  isFeatured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  _count?: {
    comments: number;
  };
  comments?: BlogComment[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    posts: number;
  };
}

export interface BlogComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  post?: {
    id: string;
    title: string;
  };
}

const blogService = {
  // Public endpoints
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: string;
    search?: string;
    featured?: boolean;
  }) => {
    const res: any = await api.get('/blog/posts', { params });
    if (res?.data && Array.isArray(res.data)) {
      return res;
    }
    if (Array.isArray(res)) {
      return { data: res, pagination: { page: 1, limit: 10, total: res.length, totalPages: 1 } };
    }
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
  },

  getPost: async (slug: string) => {
    const res: any = await api.get(`/blog/posts/${slug}`);
    return res?.data || res;
  },

  getCategories: async () => {
    const res: any = await api.get('/blog/categories');
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  },

  // Authenticated endpoints
  createComment: async (data: { postId: string; content: string }) => {
    const res: any = await api.post('/blog/comments', data);
    return res?.data || res;
  },

  // Admin endpoints
  createPost: async (formData: FormData) => {
    const res: any = await api.post('/blog/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data || res;
  },

  updatePost: async (id: string, formData: FormData) => {
    const res: any = await api.put(`/blog/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res?.data || res;
  },

  deletePost: async (id: string) => {
    const response: any = await api.delete(`/blog/posts/${id}`);
    return response;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const res: any = await api.post('/blog/categories', data);
    return res?.data || res;
  },

  updateCategory: async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
    const res: any = await api.put(`/blog/categories/${id}`, data);
    return res?.data || res;
  },

  deleteCategory: async (id: string) => {
    const response: any = await api.delete(`/blog/categories/${id}`);
    return response;
  },

  getComments: async (params?: {
    page?: number;
    limit?: number;
    postId?: string;
    isApproved?: boolean;
  }) => {
    const res: any = await api.get('/blog/comments', { params });
    return res;
  },

  approveComment: async (id: string) => {
    const res: any = await api.put(`/blog/comments/${id}/approve`);
    return res?.data || res;
  },

  deleteComment: async (id: string) => {
    const response: any = await api.delete(`/blog/comments/${id}`);
    return response;
  },
};

export default blogService;
