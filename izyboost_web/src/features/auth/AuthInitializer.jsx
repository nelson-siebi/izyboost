import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthInitializer({ children }) {
    const { fetchProfile, token } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token, fetchProfile]);

    return children;
}
