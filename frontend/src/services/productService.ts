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

  createProduct: (data: any): Promise<any> =>
    api.post<any, any>('/products', data).then((res: any) => res.data || res),

  updateProduct: (id: string, data: any): Promise<any> =>
    api.put<any, any>(`/products/${id}`, data).then((res: any) => res.data || res),

  deleteProduct: (id: string): Promise<any> =>
    api.delete<any, any>(`/products/${id}`).then((res: any) => res.data || res),

  uploadImages: (formData: FormData): Promise<any> =>
    api.post<any, any>('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res: any) => (res?.data || res)),

  getCategories: (): Promise<any> =>
    api.get<any, any>('/categories').then((res: any) => res.data || res),
};

export default productService;

