import apiClient from '../../api/client';

export const whiteLabelApi = {
    getPlans: async () => {
        const response = await apiClient.get('user/white-label/plans');
        return response.data;
    },
    getTemplates: async () => {
        const response = await apiClient.get('user/white-label/templates');
        return response.data;
    },
    getSites: async () => {
        const response = await apiClient.get('user/white-label/sites');
        return response.data;
    },
    getSite: async (uuid) => {
        const response = await apiClient.get(`user/white-label/sites/${uuid}`);
        return response.data;
    },
    purchase: async (data) => {
        const response = await apiClient.post('user/white-label/purchase', data);
        return response.data;
    },
    updateBranding: async (uuid, data) => {
        const response = await apiClient.put(`user/white-label/sites/${uuid}/branding`, data);
        return response.data;
    },
    updatePricing: async (uuid, data) => {
        const response = await apiClient.put(`user/white-label/sites/${uuid}/pricing`, data);
        return response.data;
    }
};

export const referralsApi = {
    getStats: async () => {
        const response = await apiClient.get('user/referrals/stats');
        return response.data;
    },
    getReferrals: async () => {
        const response = await apiClient.get('user/referrals/list');
        return response.data;
    },
    getCommissions: async () => {
        const response = await apiClient.get('user/referrals/commissions');
        return response.data;
    },
    getLink: async () => {
        const response = await apiClient.get('user/referrals/link');
        return response.data;
    }
};
