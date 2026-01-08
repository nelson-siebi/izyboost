import apiClient from '../../api/client';

export const notificationsApi = {
    getAll: async () => {
        const response = await apiClient.get('user/notifications');
        return response.data;
    },
    getUnreadCount: async () => {
        const response = await apiClient.get('user/notifications/unread-count');
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await apiClient.post(`user/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await apiClient.post('user/notifications/read-all');
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`user/notifications/${id}`);
        return response.data;
    }
};
