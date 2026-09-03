import api from './api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ORDER' | 'PROMOTION';
  link: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{
    type: string;
    _count: number;
  }>;
}

const notificationService = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }) => {
    const response = await api.get<{
      data: Notification[];
      unreadCount: number;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ data: { count: number } }>(
      '/notifications/unread-count'
    );
    return response.data.data.count;
  },

  markAsRead: async (id: string) => {
    const response = await api.put<{ data: Notification }>(
      `/notifications/${id}/read`
    );
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/delete-all');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get<{ data: NotificationStats }>(
      '/notifications/stats'
    );
    return response.data.data;
  },
};

export default notificationService;
