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
    deleteUser: async (id) => {
        const response = await apiClient.delete(`admin/users/${id}`);
        return response.data;
    },

    // Orders
    getOrders: async (page = 1, status = null) => {
        const params = new URLSearchParams({ page: page.toString() });
        if (status) {
            params.append('status', status);
        }
        const response = await apiClient.get(`admin/orders?${params.toString()}`);
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
    createSaaSPlan: async (data) => {
        const response = await apiClient.post('admin/white-label/plans', data);
        return response.data;
    },
    updateSaaSPlan: async (id, data) => {
        const response = await apiClient.put(`admin/white-label/plans/${id}`, data);
        return response.data;
    },
    deleteSaaSPlan: async (id) => {
        const response = await apiClient.delete(`admin/white-label/plans/${id}`);
        return response.data;
    },
    getSubscriptions: async () => {
        const response = await apiClient.get('admin/white-label/subscriptions');
        return response.data;
    },
    approveSite: async (id, data) => {
        const response = await apiClient.post(`admin/white-label/sites/${id}/approve`, data);
        return response.data;
    },
    rejectSite: async (id) => {
        const response = await apiClient.post(`admin/white-label/sites/${id}/reject`);
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
    retryOrder: async (id) => {
        const response = await apiClient.post(`admin/orders/${id}/retry`);
        return response.data;
    },
    verifyTransaction: async (id) => {
        const response = await apiClient.post(`admin/finance/transactions/${id}/verify`);
        return response.data;
    },
    rejectTransaction: async (id, reason) => {
        const response = await apiClient.post(`admin/finance/transactions/${id}/reject`, { reason });
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
    // Stats cache
    _statsCache: null,
    _pendingStatsPromise: null,

    getPlatformStats: async function (forceRefresh = false) {
        if (!forceRefresh && this._statsCache) {
            return this._statsCache;
        }

        if (this._pendingStatsPromise) {
            return this._pendingStatsPromise;
        }

        this._pendingStatsPromise = (async () => {
            try {
                const response = await apiClient.get('admin/settings/platform-stats');
                this._statsCache = response.data;
                return response.data;
            } finally {
                this._pendingStatsPromise = null;
            }
        })();

        return this._pendingStatsPromise;
    },
    // Cache management
    _settingsCache: null,
    _pendingSettingsPromise: null,
    _publicSettingsCache: null,
    _pendingPublicSettingsPromise: null,

    getSettings: async function (forceRefresh = false) {
        if (!forceRefresh && this._settingsCache) {
            return this._settingsCache;
        }

        if (this._pendingSettingsPromise) {
            return this._pendingSettingsPromise;
        }

        this._pendingSettingsPromise = (async () => {
            try {
                const response = await apiClient.get('admin/settings');
                this._settingsCache = response.data;
                return response.data;
            } finally {
                this._pendingSettingsPromise = null;
            }
        })();

        return this._pendingSettingsPromise;
    },

    getPublicSettings: async function (forceRefresh = false) {
        if (!forceRefresh && this._publicSettingsCache) {
            return this._publicSettingsCache;
        }

        if (this._pendingPublicSettingsPromise) {
            return this._pendingPublicSettingsPromise;
        }

        this._pendingPublicSettingsPromise = (async () => {
            try {
                const response = await apiClient.get('settings/public');
                this._publicSettingsCache = response.data;
                return response.data;
            } finally {
                this._pendingPublicSettingsPromise = null;
            }
        })();

        return this._pendingPublicSettingsPromise;
    },

    updateSetting: async function (key, value) {
        const response = await apiClient.put(`admin/settings/${key}`, { value });
        this._settingsCache = null; // Clear cache on update
        this._publicSettingsCache = null;
        return response.data;
    },

    updateSettings: async function (settings) {
        const response = await apiClient.post('admin/settings/bulk', { settings });
        this._settingsCache = null; // Clear cache on update
        this._publicSettingsCache = null;
        return response.data;
    },
    uploadLogo: async (formData) => {
        const response = await apiClient.post('admin/settings/upload-logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
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
    },

    // Services Management
    getAdminServices: async (page = 1, categoryId = null, isActive = null) => {
        const params = new URLSearchParams({ page: page.toString() });
        if (categoryId) params.append('category_id', categoryId);
        if (isActive !== null) params.append('is_active', isActive);
        const response = await apiClient.get(`admin/services?${params.toString()}`);
        return response.data;
    },
    updateService: async (id, data) => {
        const response = await apiClient.put(`admin/services/${id}`, data);
        return response.data;
    },
    syncServices: async () => {
        const response = await apiClient.post('admin/services/sync');
        return response.data;
    },
    getAdminCategories: async () => {
        const response = await apiClient.get('admin/services/categories');
        return response.data;
    }
};
