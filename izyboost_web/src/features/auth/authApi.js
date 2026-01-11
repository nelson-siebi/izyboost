import apiClient from '../../api/client';

export const authApi = {
    login: async ({ email, password }) => {
        const response = await apiClient.post('auth/login', {
            email_or_username: email,
            password
        });
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('auth/register', userData);
        return response.data;
    },

    getMe: async () => {
        const response = await apiClient.get('user/me');
        return response.data;
    },

    logout: async (credentials) => {
        const response = await apiClient.post('user/logout');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await apiClient.post('auth/reset-password', data);
        return response.data;
    }
};
