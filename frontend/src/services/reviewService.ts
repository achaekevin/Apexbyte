import api from './api';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    stats: ReviewStats;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

class ReviewService {
  /**
   * Get featured reviews for homepage showcase
   */
  async getFeaturedReviews(limit = 6): Promise<any[]> {
    const response = await api.get<any, any>('/reviews/featured', { params: { limit } });
    return response.data || response;
  }

  /**
   * Get all reviews with filters
   */
  async getAllReviews(params?: any): Promise<any> {
    const response = await api.get<any, any>('/reviews', { params });
    return response.data || response;
  }

  /**
   * Get reviews for a product
   */
  async getProductReviews(
    productId: string,
    page = 1,
    limit = 10,
    sort = 'recent'
  ): Promise<any> {
    const response = await api.get<any, any>(
      `/reviews/product/${productId}`,
      {
        params: { page, limit, sort },
      }
    );
    return response.data || response;
  }

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productId: string): Promise<ReviewStats> {
    const response = await api.get<any, { success: boolean; data: ReviewStats }>(
      `/reviews/product/${productId}`,
      { params: { limit: 1 } }
    );
    return response.data;
  }

  /**
   * Create a review
   */
  async createReview(data: CreateReviewData | FormData): Promise<any> {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post<any, any>('/reviews', data, { headers });
    return response.data || response;
  }

  /**
   * Update a review
   */
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    const response = await api.patch<any, ReviewResponse>(
      `/reviews/${reviewId}`,
      data
    );
    return response.data;
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/reviews/${reviewId}`);
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<void> {
    await api.post(`/reviews/${reviewId}/helpful`);
  }

  async markAsHelpful(reviewId: string): Promise<void> {
    return this.markHelpful(reviewId);
  }

  /**
   * Get user's reviews
   */
  async getUserReviews(page = 1, limit = 10): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get<any, { success: boolean; data: any }>(
      '/reviews/my-reviews',
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  /**
   * Check if user can review a product
   */
  async canReviewProduct(productId: string): Promise<boolean> {
    try {
      const response = await api.get<any, { success: boolean; data: { canReview: boolean } }>(
        `/products/${productId}/can-review`
      );
      return response.data.canReview;
    } catch (error) {
      return false;
    }
  }
}

export default new ReviewService();
