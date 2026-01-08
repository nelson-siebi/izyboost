import { create } from 'zustand';
import { authApi } from '../features/auth/authApi';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isInitializing: !!localStorage.getItem('token'),

    setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true, isInitializing: false });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
    },

    setUser: (user) => set({ user, isInitializing: false }),

    fetchProfile: async () => {
        const token = get().token;
        if (!token) {
            set({ isInitializing: false });
            return;
        }

        try {
            const user = await authApi.getMe();
            set({ user, isAuthenticated: true, isInitializing: false });
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
        }
    }
}));
