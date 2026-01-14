import axios from 'axios';

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL;
    if (!url || url === 'undefined') {

        return 'https://izymail.nelsius.com/api';
        
    }
    return url;
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

console.log('📡 API Resolved BaseURL:', apiClient.defaults.baseURL);

// Interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Potential redirect to login if not already there
            if (!window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
