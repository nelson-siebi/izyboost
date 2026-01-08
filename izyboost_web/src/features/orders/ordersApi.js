import apiClient from '../../api/client';

export const ordersApi = {
    // Get all orders with pagination and optional filters
    getOrders: async (page = 1, status = '') => {
        const params = new URLSearchParams();
        params.append('page', page);
        if (status && status !== 'all') {
            params.append('status', status);
        }

        const response = await apiClient.get(`user/orders?${params.toString()}`);
        return response.data;
    }
};
