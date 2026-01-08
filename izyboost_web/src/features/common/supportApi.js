import apiClient from '../../api/client';

export const developerApi = {
    // API Keys
    getKeys: async () => {
        const response = await apiClient.get('user/api-keys');
        return response.data;
    },
    createKey: async (name) => {
        const response = await apiClient.post('user/api-keys', { name });
        return response.data;
    },
    deleteKey: async (id) => {
        const response = await apiClient.delete(`user/api-keys/${id}`);
        return response.data;
    },
    getLogs: async (id) => {
        const response = await apiClient.get(`user/api-keys/${id}/logs`);
        return response.data;
    },
    regenerateKey: async (id) => {
        // Assuming there isn't a direct regenerate endpoint in standard Laravel Sanctum setup often used for keys, 
        // usually it's delete and create new, but if supported we'd add it. 
        // For now, delete and create is the standard pattern unless specified.
        return null;
    }
};

export const supportApi = {
    // Tickets
    getTickets: async () => {
        const response = await apiClient.get('user/tickets');
        return response.data;
    },
    getTicket: async (uuid) => {
        const response = await apiClient.get(`user/tickets/${uuid}`);
        return response.data;
    },
    createTicket: async (data) => {
        const response = await apiClient.post('user/tickets', data);
        return response.data;
    },
    replyTicket: async (uuid, message) => {
        const response = await apiClient.post(`user/tickets/${uuid}/reply`, { message });
        return response.data;
    },
    closeTicket: async (uuid) => {
        const response = await apiClient.post(`user/tickets/${uuid}/close`);
        return response.data;
    }
};
