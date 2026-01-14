import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export default function AuthInitializer({ children }) {
    const { fetchProfile, token } = useAuthStore();

    useEffect(() => {
        // Capture referral code from URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || params.get('code');
        if (ref) {
            localStorage.setItem('sponsor_code', ref);
            console.log('Referral code captured:', ref);
        }

        if (token) {
            fetchProfile();
        }
    }, [token, fetchProfile]);

    return children;
}
