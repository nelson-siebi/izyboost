import apiClient from '../../api/client';

export const walletApi = {
    // Get wallet details (balance, stats)
    getWallet: async () => {
        const response = await apiClient.get('user/wallet');
        return response.data;
    },

    // Get transaction history
    getTransactions: async (page = 1) => {
        const response = await apiClient.get(`user/wallet/transactions?page=${page}`);
        return response.data;
    },

    // Get available deposit methods
    getDepositMethods: async () => {
        const response = await apiClient.get('user/wallet/deposit-methods');
        return response.data;
    },

    // Initiate a deposit
    deposit: async (data) => {
        const response = await apiClient.post('user/wallet/deposit', data);
        return response.data;
    },

    // Check transaction status
    checkStatus: async (reference) => {
        const response = await apiClient.get(`user/wallet/transactions/${reference}/status`);
        return response.data;
    }
};
