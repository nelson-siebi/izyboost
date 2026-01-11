import apiClient from '../../api/client';

export const dashboardApi = {
    getStats: async () => {
        const [userResponse, ordersResponse, walletResponse, servicesResponse] = await Promise.all([
            apiClient.get('user/me'),
            apiClient.get('user/orders'),
            apiClient.get('user/wallet'),
            apiClient.get('services')
        ]);

        // Process categories and flatten services
        const categories = servicesResponse.data || [];
        const allServices = categories.flatMap(cat =>
            (cat.services || []).map(svc => ({
                ...svc,
                platform: {
                    id: cat.id,
                    name: cat.name,
                    slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
                }
            }))
        );

        // Extract unique platforms from categories
        let platforms = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug || cat.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
        }));

        // Fallback if no platforms found (simulate from common ones if needed, or keep empty)
        if (platforms.length === 0) {
            platforms = [
                { id: 'fb', name: 'Facebook', slug: 'facebook' },
                { id: 'ig', name: 'Instagram', slug: 'instagram' },
                { id: 'tt', name: 'TikTok', slug: 'tiktok' },
                { id: 'yt', name: 'YouTube', slug: 'youtube' },
                { id: 'li', name: 'LinkedIn', slug: 'linkedin' },
                { id: 'tw', name: 'Twitter', slug: 'twitter' },
                { id: 'sp', name: 'Spotify', slug: 'spotify' },
                { id: 'tg', name: 'Telegram', slug: 'telegram' }
            ];
        }

        return {
            user: userResponse.data,
            user: userResponse.data,
            recentOrders: (ordersResponse.data?.data || (Array.isArray(ordersResponse.data) ? ordersResponse.data : [])),
            wallet: walletResponse.data,
            services: allServices,
            platforms: platforms,
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
