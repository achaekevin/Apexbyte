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
    const response = await api.get<{
      data: BlogPost[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/blog/posts', { params });
    return response.data;
  },

  getPost: async (slug: string) => {
    const response = await api.get<{ data: BlogPost }>(`/blog/posts/${slug}`);
    return response.data.data;
  },

  getCategories: async () => {
    const response = await api.get<{ data: BlogCategory[] }>(
      '/blog/categories'
    );
    return response.data.data;
  },

  // Authenticated endpoints
  createComment: async (data: { postId: string; content: string }) => {
    const response = await api.post<{ data: BlogComment }>(
      '/blog/comments',
      data
    );
    return response.data.data;
  },

  // Admin endpoints
  createPost: async (formData: FormData) => {
    const response = await api.post<{ data: BlogPost }>(
      '/blog/posts',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  updatePost: async (id: string, formData: FormData) => {
    const response = await api.put<{ data: BlogPost }>(
      `/blog/posts/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/blog/posts/${id}`);
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await api.post<{ data: BlogCategory }>(
      '/blog/categories',
      data
    );
    return response.data.data;
  },

  updateCategory: async (
    id: string,
    data: { name?: string; description?: string }
  ) => {
    const response = await api.put<{ data: BlogCategory }>(
      `/blog/categories/${id}`,
      data
    );
    return response.data.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/blog/categories/${id}`);
    return response.data;
  },

  getComments: async (params?: {
    page?: number;
    limit?: number;
    postId?: string;
    isApproved?: boolean;
  }) => {
    const response = await api.get<{
      data: BlogComment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/blog/comments', { params });
    return response.data;
  },

  approveComment: async (id: string) => {
    const response = await api.put<{ data: BlogComment }>(
      `/blog/comments/${id}/approve`
    );
    return response.data.data;
  },

  deleteComment: async (id: string) => {
    const response = await api.delete(`/blog/comments/${id}`);
    return response.data;
  },
};

export default blogService;
