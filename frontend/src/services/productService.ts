import api from './api';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: number[];
  storage?: number[];
  processorBrand?: string[];
  sortBy?: string;
}

export const productService = {
  getProducts: (filters: ProductFilters) =>
    api.get('/products', { params: filters }),
  
  getProduct: (id: string) => api.get(`/products/${id}`),
  
  getProductBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
  
  getFeaturedProducts: () => api.get('/products?isFeatured=true&limit=8'),
  
  getNewArrivals: () => api.get('/products?isNewArrival=true&limit=8'),
  
  getBestSellers: () => api.get('/products?isBestSeller=true&limit=8'),
  
  getRelatedProducts: (productId: string) =>
    api.get(`/products/${productId}/related`),
};

export default productService;
