import { Response } from 'express';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, isRead } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      userId: req.user!.id,
    };

    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const getUnreadCount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
    });

    res.json({
      success: true,
      data: { count },
    });
  }
);

export const markAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: updated,
    });
  }
);

export const markAllAsRead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }
);

export const deleteNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    await prisma.notification.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  }
);

export const deleteAllNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await prisma.notification.deleteMany({
      where: {
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      message: 'All notifications deleted successfully',
    });
  }
);

export const createNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId, title, message, type, link } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: link ? JSON.stringify({ link }) : undefined,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification,
    });
  }
);

export const sendBulkNotification = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userIds, title, message, type, link } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AppError('User IDs array is required', 400);
    }

    const notifications = userIds.map((userId) => ({
      userId,
      title,
      message,
      type: type || 'SYSTEM',
      data: link ? JSON.stringify({ link }) : undefined,
    }));

    await prisma.notification.createMany({
      data: notifications,
    });

    res.status(201).json({
      success: true,
      message: `Notifications sent to ${userIds.length} users`,
    });
  }
);

export const getNotificationStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const stats = await prisma.notification.groupBy({
      by: ['type'],
      where: {
        userId: req.user!.id,
      },
      _count: true,
    });

    const [totalNotifications, unreadCount] = await Promise.all([
      prisma.notification.count({
        where: { userId: req.user!.id },
      }),
      prisma.notification.count({
        where: {
          userId: req.user!.id,
          isRead: false,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalNotifications,
        unread: unreadCount,
        byType: stats,
      },
    });
  }
);

// Admin notifications
export const getAllNotifications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, userId, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (userId) where.userId = String(userId);
    if (type) where.type = String(type);

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  }
);

export const getNotificationAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const [totalNotifications, byType, recentActivity] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.notification.findMany({
        take: 10,
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
        totalNotifications,
        byType,
        recentActivity,
      },
    });
  }
);
