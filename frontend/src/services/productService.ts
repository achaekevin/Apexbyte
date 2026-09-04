import api from './api';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string;
  category?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  ram?: number[] | string;
  storage?: number[] | string;
  processorBrand?: string[] | string;
  processor?: string;
  sort?: string;
  order?: string;
  sortBy?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  [key: string]: any;
}

export const productService = {
  getProducts: (filters: ProductFilters): Promise<any> =>
    api.get<any, any>('/products', { params: filters }),
  
  getProduct: (id: string): Promise<any> =>
    api.get<any, any>(`/products/${id}`).then((res: any) => res.data || res),
  
  getProductBySlug: (slug: string): Promise<any> =>
    api.get<any, any>(`/products/slug/${slug}`).then((res: any) => res.data || res),
  
  getFeaturedProducts: (): Promise<any> =>
    api.get<any, any>('/products?isFeatured=true&limit=8'),
  
  getNewArrivals: (): Promise<any> =>
    api.get<any, any>('/products?isNewArrival=true&limit=8'),
  
  getBestSellers: (): Promise<any> =>
    api.get<any, any>('/products?isBestSeller=true&limit=8'),
  
  getRelatedProducts: (productId: string): Promise<any> =>
    api.get<any, any>(`/products/${productId}/related`).then((res: any) => res.data || res),
};

export default productService;

