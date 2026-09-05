import api from './api';

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  type?: 'HOME' | 'WORK' | 'OTHER';
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressFormData {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
  type?: 'HOME' | 'WORK' | 'OTHER';
}

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const res: any = await api.get('/users/addresses');
    const data = res?.data !== undefined ? res.data : res;
    return Array.isArray(data) ? data : [];
  },

  createAddress: async (data: AddressFormData): Promise<Address> => {
    const res: any = await api.post('/users/addresses', data);
    return res?.data !== undefined ? res.data : res;
  },

  updateAddress: async (id: string, data: Partial<AddressFormData>): Promise<Address> => {
    const res: any = await api.put(`/users/addresses/${id}`, data);
    return res?.data !== undefined ? res.data : res;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/users/addresses/${id}`);
  },
};

export default addressService;
