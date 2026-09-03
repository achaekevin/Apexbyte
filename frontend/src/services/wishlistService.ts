import api from './api';

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images: Array<{
      url: string;
      alt?: string;
    }>;
    stockQuantity: number;
    isActive: boolean;
  };
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
  message?: string;
}

export interface WishlistItemResponse {
  success: boolean;
  data: WishlistItem;
  message?: string;
}

class WishlistService {
  /**
   * Get user's wishlist
   */
  async getWishlist(): Promise<WishlistItem[]> {
    const response = await api.get<any, WishlistResponse>('/wishlist');
    return response.data;
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response = await api.post<any, WishlistItemResponse>('/wishlist', {
      productId,
    });
    return response.data;
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string): Promise<void> {
    await api.delete(`/wishlist/${productId}`);
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some((item) => item.productId === productId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Toggle product in wishlist (add if not exists, remove if exists)
   */
  async toggleWishlist(productId: string): Promise<boolean> {
    try {
      const isInWishlist = await this.isInWishlist(productId);
      
      if (isInWishlist) {
        await this.removeFromWishlist(productId);
        return false;
      } else {
        await this.addToWishlist(productId);
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<void> {
    const wishlist = await this.getWishlist();
    await Promise.all(
      wishlist.map((item) => this.removeFromWishlist(item.productId))
    );
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount(): Promise<number> {
    const wishlist = await this.getWishlist();
    return wishlist.length;
  }
}

export default new WishlistService();
