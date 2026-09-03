import api from './api';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: any[];
}

export interface SalesAnalytics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    product: any;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export interface RevenueAnalytics {
  period: string;
  revenue: number;
  orders: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  topCustomers: Array<{
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    joinedAt: string;
  }>;
  customerGrowth: Array<{
    month: string;
    count: number;
  }>;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  topSellingProducts: Array<{
    product: any;
    unitsSold: number;
    revenue: number;
  }>;
  productsByCategory: Array<{
    category: string;
    count: number;
  }>;
  productsByBrand: Array<{
    brand: string;
    count: number;
  }>;
}

const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get<{ data: DashboardStats }>(
      '/analytics/dashboard'
    );
    return response.data.data;
  },

  getSalesAnalytics: async (params?: {
    period?: '7d' | '30d' | '90d' | '365d';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<{ data: SalesAnalytics }>(
      '/analytics/sales',
      { params }
    );
    return response.data.data;
  },

  getRevenueAnalytics: async (params?: {
    period?: 'daily' | 'weekly' | 'monthly';
  }) => {
    const response = await api.get<{ data: RevenueAnalytics[] }>(
      '/analytics/revenue',
      { params }
    );
    return response.data.data;
  },

  getCustomerAnalytics: async () => {
    const response = await api.get<{ data: CustomerAnalytics }>(
      '/analytics/customers'
    );
    return response.data.data;
  },

  getProductAnalytics: async () => {
    const response = await api.get<{ data: ProductAnalytics }>(
      '/analytics/products'
    );
    return response.data.data;
  },

  getOrderAnalytics: async () => {
    const response = await api.get<{
      data: {
        ordersByStatus: any[];
        ordersByPaymentStatus: any[];
        ordersByPaymentMethod: any[];
      };
    }>('/analytics/orders');
    return response.data.data;
  },

  getReviewAnalytics: async () => {
    const response = await api.get<{
      data: {
        totalReviews: number;
        averageRating: number;
        reviewsByRating: any[];
        recentReviews: any[];
      };
    }>('/analytics/reviews');
    return response.data.data;
  },

  exportData: async (params: {
    type: 'orders' | 'customers' | 'products' | 'inventory';
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get<{ data: any[] }>('/analytics/export', {
      params,
    });
    return response.data.data;
  },
};

export default analyticsService;
