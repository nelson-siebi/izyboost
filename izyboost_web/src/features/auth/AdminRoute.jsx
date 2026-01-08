import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AdminRoute({ children }) {
    const { user, isAuthenticated, isInitializing } = useAuthStore();

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-slate-400 font-bold animate-pulse">Vérification de l'accès...</p>
            </div>
        );
    }

    const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.is_admin === true || user?.role === 1);

    return isAdmin ? (children || <Outlet />) : <Navigate to="/" replace />;
}
