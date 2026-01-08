import apiClient from '../../api/client';

export const adminApi = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await apiClient.get('admin/dashboard');
        return response.data;
    },
    getRevenueChart: async (period = 'month') => {
        const response = await apiClient.get(`admin/dashboard/revenue-chart?period=${period}`);
        return response.data;
    },
    getRevenueStats: async () => {
        const response = await apiClient.get('admin/dashboard/revenue-chart');
        return response.data;
    },

    // Users
    getUsers: async (page = 1, search = '') => {
        const response = await apiClient.get(`admin/users?page=${page}&search=${search}`);
        return response.data;
    },
    getUser: async (id) => {
        const response = await apiClient.get(`admin/users/${id}`);
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await apiClient.put(`admin/users/${id}`, data);
        return response.data;
    },
    toggleBan: async (id) => {
        const response = await apiClient.post(`admin/users/${id}/toggle-ban`);
        return response.data;
    },
    adjustBalance: async (id, amount, reason) => {
        const response = await apiClient.post(`admin/users/${id}/adjust-balance`, {
            amount,
            type: amount >= 0 ? 'add' : 'subtract',
            reason
        });
        return response.data;
    },

    // Orders
    getOrders: async (page = 1, status = '') => {
        const response = await apiClient.get(`admin/orders?page=${page}&status=${status}`);
        return response.data;
    },
    updateOrderStatus: async (id, status) => {
        const response = await apiClient.put(`admin/orders/${id}/status`, { status });
        return response.data;
    },
    refundOrder: async (id) => {
        const response = await apiClient.post(`admin/orders/${id}/refund`);
        return response.data;
    },

    // SaaS / White Label
    getSaaSPlans: async () => {
        const response = await apiClient.get('admin/white-label/plans');
        return response.data;
    },
    updateSaaSPlan: async (id, data) => {
        const response = await apiClient.put(`admin/white-label/plans/${id}`, data);
        return response.data;
    },
    getSubscriptions: async () => {
        const response = await apiClient.get('admin/white-label/subscriptions');
        return response.data;
    },

    // Finances & Settings
    getFinanceStats: async () => {
        const response = await apiClient.get('admin/finance/stats');
        return response.data;
    },
    getTransactions: async (page = 1) => {
        const response = await apiClient.get(`admin/finance/transactions?page=${page}`);
        return response.data;
    },
    verifyTransaction: async (id) => {
        const response = await apiClient.post(`admin/finance/transactions/${id}/verify`);
        return response.data;
    },
    getPaymentMethods: async () => {
        const response = await apiClient.get('admin/finance/payment-methods');
        return response.data;
    },
    updatePaymentMethod: async (id, data) => {
        const response = await apiClient.put(`admin/finance/payment-methods/${id}`, data);
        return response.data;
    },
    getPlatformStats: async () => {
        const response = await apiClient.get('admin/settings/platform-stats');
        return response.data;
    },
    getSettings: async () => {
        const response = await apiClient.get('admin/settings');
        return response.data;
    },
    updateSetting: async (key, value) => {
        const response = await apiClient.put(`admin/settings/${key}`, { value });
        return response.data;
    },

    // Support
    getTickets: async (page = 1, status = '') => {
        const response = await apiClient.get(`admin/support/tickets?page=${page}&status=${status}`);
        return response.data;
    },
    getTicket: async (uuid) => {
        const response = await apiClient.get(`admin/support/tickets/${uuid}`);
        return response.data;
    },
    replyTicket: async (uuid, message) => {
        const response = await apiClient.post(`admin/support/tickets/${uuid}/reply`, { message });
        return response.data;
    },
    closeTicket: async (uuid) => {
        const response = await apiClient.post(`admin/support/tickets/${uuid}/close`);
        return response.data;
    }
};
