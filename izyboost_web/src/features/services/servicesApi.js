import apiClient from '../../api/client';

export const servicesApi = {
    getCategories: async () => {
        const response = await apiClient.get('services');
        return response.data; // Expected: [{ id, name, services: [...] }, ...]
    }
};
