import apiClient from '../../api/client';

export const dashboardApi = {
    getStats: async () => {
        const [userResponse, ordersResponse, walletResponse] = await Promise.all([
            apiClient.get('user/me'),
            apiClient.get('user/orders'),
            apiClient.get('user/wallet')
        ]);

        return {
            user: userResponse.data,
            recentOrders: ordersResponse.data.data || ordersResponse.data,
            wallet: walletResponse.data,
            summary: {
                totalOrders: ordersResponse.data.total || (Array.isArray(ordersResponse.data) ? ordersResponse.data.length : 0),
                activeOrders: (ordersResponse.data.data || ordersResponse.data).filter(o => o.status === 'processing' || o.status === 'pending').length,
                balance: userResponse.data.balance || 0
            }
        };
    },

    getCategories: async () => {
        const response = await apiClient.get('services');
        return response.data;
    },

    placeOrder: async (orderData) => {
        const response = await apiClient.post('user/orders', orderData);
        return response.data;
    }
};
