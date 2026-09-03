import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      prisma.product.count({
        where: { stock: { lte: 10, gt: 0 }, isActive: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        lowStockProducts,
        recentOrders,
      },
    });
  }
);

export const getSalesAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { period = '30d', startDate, endDate } = req.query;

    let dateFilter: any = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      };
    } else {
      const daysMap: any = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '365d': 365,
      };
      const days = daysMap[period as string] || 30;
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);

      dateFilter = {
        createdAt: { gte: startDate },
      };
    }

    const [salesByDay, totalSales, averageOrderValue, topProducts] =
      await Promise.all([
        prisma.order.groupBy({
          by: ['createdAt'],
          where: {
            ...dateFilter,
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
          _sum: {
            totalAmount: true,
          },
          _count: true,
        }),
        prisma.order.aggregate({
          where: {
            ...dateFilter,
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: {
            ...dateFilter,
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
          _avg: { totalAmount: true },
        }),
        prisma.orderItem.groupBy({
          by: ['productId'],
          where: {
            order: {
              ...dateFilter,
              status: { notIn: ['CANCELLED', 'REFUNDED'] },
            },
          },
          _sum: {
            quantity: true,
            price: true,
          },
          orderBy: {
            _sum: {
              quantity: 'desc',
            },
          },
          take: 10,
        }),
      ]);

    const topProductIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        name: true,
        images: true,
        brand: { select: { name: true } },
      },
    });

    const topProductsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.price || 0,
      };
    });

    const dailySalesData = salesByDay.map((day) => ({
      date: day.createdAt,
      revenue: day._sum.totalAmount || 0,
      orders: day._count,
    }));

    res.json({
      success: true,
      data: {
        totalSales: totalSales._sum.totalAmount || 0,
        totalOrders: totalSales._count,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        dailySales: dailySalesData,
        topProducts: topProductsWithDetails,
      },
    });
  }
);

export const getRevenueAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { period = 'monthly' } = req.query;

    const now = new Date();
    const startDate = new Date(now);

    if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 12);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 84); // 12 weeks
    } else {
      startDate.setDate(startDate.getDate() - 30);
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        discount: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const revenueByPeriod: any = {};

    orders.forEach((order) => {
      let key: string;
      const date = new Date(order.createdAt);

      if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!revenueByPeriod[key]) {
        revenueByPeriod[key] = {
          period: key,
          revenue: 0,
          orders: 0,
          subtotal: 0,
          shippingCost: 0,
          tax: 0,
          discount: 0,
        };
      }

      revenueByPeriod[key].revenue += Number(order.totalAmount);
      revenueByPeriod[key].subtotal += Number(order.subtotal);
      revenueByPeriod[key].shippingCost += Number(order.shippingCost);
      revenueByPeriod[key].tax += Number(order.tax);
      revenueByPeriod[key].discount += Number(order.discount);
      revenueByPeriod[key].orders += 1;
    });

    const revenueData = Object.values(revenueByPeriod);

    res.json({
      success: true,
      data: revenueData,
    });
  }
);

export const getCustomerAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
      customersByMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          orders: {
            where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
            select: { totalAmount: true },
          },
        },
        take: 100,
      }),
      prisma.user.groupBy({
        by: ['createdAt'],
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
        _count: true,
      }),
    ]);

    const topCustomersWithStats = topCustomers
      .map((customer) => {
        const totalSpent = customer.orders.reduce(
          (sum, order) => sum + Number(order.totalAmount),
          0
        );
        return {
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          email: customer.email,
          totalOrders: customer.orders.length,
          totalSpent,
          joinedAt: customer.createdAt,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    const customerGrowth: any = {};
    customersByMonth.forEach((item) => {
      const date = new Date(item.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      customerGrowth[key] = (customerGrowth[key] || 0) + item._count;
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomersThisMonth,
        topCustomers: topCustomersWithStats,
        customerGrowth: Object.entries(customerGrowth).map(([month, count]) => ({
          month,
          count,
        })),
      },
    });
  }
);

export const getProductAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [
      totalProducts,
      activeProducts,
      lowStockProducts,
      topSellingProducts,
      productsByCategory,
      productsByBrand,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: { stock: { lte: 10, gt: 0 }, isActive: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            status: { notIn: ['CANCELLED', 'REFUNDED'] },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      prisma.product.groupBy({
        by: ['categoryId'],
        _count: true,
      }),
      prisma.product.groupBy({
        by: ['brandId'],
        _count: true,
      }),
    ]);

    const topProductIds = topSellingProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const topProducts = topSellingProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        unitsSold: item._sum.quantity || 0,
        revenue: item._sum.price || 0,
      };
    });

    const categoryIds = productsByCategory.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoriesData = productsByCategory.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      return {
        category: category?.name || 'Unknown',
        count: item._count,
      };
    });

    const brandIds = productsByBrand.map((b) => b.brandId);
    const brands = await prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    });

    const brandsData = productsByBrand.map((item) => {
      const brand = brands.find((b) => b.id === item.brandId);
      return {
        brand: brand?.name || 'Unknown',
        count: item._count,
      };
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        lowStockProducts,
        topSellingProducts: topProducts,
        productsByCategory: categoriesData,
        productsByBrand: brandsData,
      },
    });
  }
);

export const getOrderAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [ordersByStatus, ordersByPaymentStatus, ordersByPaymentMethod] =
      await Promise.all([
        prisma.order.groupBy({
          by: ['status'],
          _count: true,
        }),
        prisma.order.groupBy({
          by: ['paymentStatus'],
          _count: true,
        }),
        prisma.order.groupBy({
          by: ['paymentMethod'],
          _count: true,
        }),
      ]);

    res.json({
      success: true,
      data: {
        ordersByStatus,
        ordersByPaymentStatus,
        ordersByPaymentMethod,
      },
    });
  }
);

export const getReviewAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [totalReviews, averageRating, reviewsByRating, recentReviews] =
      await Promise.all([
        prisma.review.count(),
        prisma.review.aggregate({
          _avg: { rating: true },
        }),
        prisma.review.groupBy({
          by: ['rating'],
          _count: true,
        }),
        prisma.review.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            product: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalReviews,
        averageRating: averageRating._avg.rating || 0,
        reviewsByRating,
        recentReviews,
      },
    });
  }
);

export const getExportData = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { type, startDate, endDate } = req.query;

    const dateFilter = startDate && endDate
      ? {
          createdAt: {
            gte: new Date(startDate as string),
            lte: new Date(endDate as string),
          },
        }
      : {};

    let data: any;

    switch (type) {
      case 'orders':
        data = await prisma.order.findMany({
          where: dateFilter,
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        });
        break;

      case 'customers':
        data = await prisma.user.findMany({
          where: {
            role: 'CUSTOMER',
            ...dateFilter,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
            orders: {
              select: {
                totalAmount: true,
              },
            },
          },
        });
        break;

      case 'products':
        data = await prisma.product.findMany({
          include: {
            brand: { select: { name: true } },
            category: { select: { name: true } },
          },
        });
        break;

      case 'inventory':
        data = await prisma.inventoryLog.findMany({
          where: dateFilter,
          include: {
            product: {
              select: {
                name: true,
                sku: true,
              },
            },
          },
        });
        break;

      default:
        data = [];
    }

    res.json({
      success: true,
      data,
    });
  }
);
