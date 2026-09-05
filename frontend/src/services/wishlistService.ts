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
    const response: any = await api.get('/wishlist');
    const payload = response?.data !== undefined ? response.data : response;
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload?.items && Array.isArray(payload.items)) {
      return payload.items;
    }
    return [];
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response: any = await api.post('/wishlist/items', {
      productId,
    });
    return response?.data || response;
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(idOrProductId: string): Promise<void> {
    await api.delete(`/wishlist/items/${idOrProductId}`);
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(productId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some(
        (item: any) => item.productId === productId || item.product?.id === productId
      );
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
      wishlist.map((item: any) => this.removeFromWishlist(item.id || item.productId))
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
