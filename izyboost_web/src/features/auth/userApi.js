import apiClient from '../../api/client';

export const userApi = {
    updateProfile: async (data) => {
        const response = await apiClient.put('user/profile', data);
        return response.data;
    },
    updatePassword: async (data) => {
        const response = await apiClient.put('user/password', data);
        return response.data;
    },
    updateSettings: async (data) => {
        const response = await apiClient.put('user/settings', data);
        return response.data;
    },
    toggle2FA: async () => {
        const response = await apiClient.post('user/toggle-2fa');
        return response.data;
    }
};
