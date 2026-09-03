import api from './api';

export interface InventoryLog {
  id: string;
  productId: string;
  orderId: string | null;
  type: 'SALE' | 'RETURN' | 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGED';
  quantityChange: number;
  quantityAfter: number;
  reason: string | null;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  brand: {
    name: string;
  };
  images: string[];
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockUnits: number;
  recentLogs: InventoryLog[];
}

export interface StockAlert {
  id: string;
  productId: string;
  threshold: number;
  isTriggered: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    stock: number;
  };
}

const inventoryService = {
  getInventoryLogs: async (params?: {
    page?: number;
    limit?: number;
    productId?: string;
    type?: string;
  }) => {
    const response = await api.get<{
      data: InventoryLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/inventory/logs', { params });
    return response.data;
  },

  getLowStockProducts: async (threshold?: number) => {
    const response = await api.get<{
      data: LowStockProduct[];
      count: number;
    }>('/inventory/low-stock', {
      params: { threshold },
    });
    return response.data;
  },

  getOutOfStockProducts: async () => {
    const response = await api.get<{
      data: LowStockProduct[];
      count: number;
    }>('/inventory/out-of-stock');
    return response.data;
  },

  updateStock: async (
    productId: string,
    data: {
      quantity: number;
      reason?: string;
      type?: 'SALE' | 'RETURN' | 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGED';
    }
  ) => {
    const response = await api.put<{
      data: {
        productId: string;
        previousStock: number;
        newStock: number;
        quantityChange: number;
      };
    }>(`/inventory/products/${productId}/stock`, data);
    return response.data.data;
  },

  bulkUpdateStock: async (
    updates: Array<{
      productId: string;
      quantity: number;
      reason?: string;
    }>
  ) => {
    const response = await api.post<{
      data: Array<{
        productId: string;
        success: boolean;
        error?: string;
        previousStock?: number;
        newStock?: number;
      }>;
    }>('/inventory/bulk-update', { updates });
    return response.data.data;
  },

  getInventoryStats: async () => {
    const response = await api.get<{ data: InventoryStats }>(
      '/inventory/stats'
    );
    return response.data.data;
  },

  getStockHistory: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ) => {
    const response = await api.get<{
      data: {
        product: {
          name: string;
          sku: string;
          stock: number;
        };
        logs: InventoryLog[];
      };
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/inventory/products/${productId}/history`, { params });
    return response.data;
  },

  getStockAlerts: async (triggered?: boolean) => {
    const response = await api.get<{ data: StockAlert[] }>(
      '/inventory/alerts',
      {
        params: { triggered },
      }
    );
    return response.data.data;
  },

  createStockAlert: async (data: {
    productId: string;
    threshold: number;
    enabled?: boolean;
  }) => {
    const response = await api.post<{ data: StockAlert }>(
      '/inventory/alerts',
      data
    );
    return response.data.data;
  },

  updateStockAlert: async (
    id: string,
    data: {
      threshold?: number;
      enabled?: boolean;
    }
  ) => {
    const response = await api.put<{ data: StockAlert }>(
      `/inventory/alerts/${id}`,
      data
    );
    return response.data.data;
  },

  deleteStockAlert: async (id: string) => {
    const response = await api.delete(`/inventory/alerts/${id}`);
    return response.data;
  },
};

export default inventoryService;
