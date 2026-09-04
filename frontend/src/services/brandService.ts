import api from './api';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive?: boolean;
  order?: number;
  _count?: {
    products: number;
  };
}

export interface CreateBrandData {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
}

export const brandService = {
  getBrands: (): Promise<Brand[]> =>
    api.get<any, any>('/brands').then((res: any) => res.data || res),

  getBrand: (id: string): Promise<Brand> =>
    api.get<any, any>(`/brands/${id}`).then((res: any) => res.data || res),

  createBrand: (data: CreateBrandData): Promise<Brand> =>
    api.post<any, any>('/brands', data).then((res: any) => res.data || res),

  updateBrand: (id: string, data: Partial<CreateBrandData>): Promise<Brand> =>
    api.put<any, any>(`/brands/${id}`, data).then((res: any) => res.data || res),

  deleteBrand: (id: string): Promise<any> =>
    api.delete<any, any>(`/brands/${id}`).then((res: any) => res.data || res),
};

export default brandService;
