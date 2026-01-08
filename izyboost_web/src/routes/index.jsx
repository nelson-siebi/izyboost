import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import DashboardPage from '../pages/Dashboard';
import WalletPage from '../pages/WalletPage';
import OrdersPage from '../pages/OrdersPage';

import WhiteLabelPage from '../pages/WhiteLabelPage';
import ReferralsPage from '../pages/ReferralsPage';

import ServicesPage from '../pages/ServicesPage';
import NotFoundPage from '../pages/NotFoundPage';

import ApiKeysPage from '../pages/ApiKeysPage';
import SupportPage from '../pages/SupportPage';

import SettingsPage from '../pages/SettingsPage';
import DocumentationPage from '../pages/DocumentationPage';

// Admin Imports
import AdminLayout from '../layouts/AdminLayout';
import AdminRoute from '../features/auth/AdminRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminSaaSPage from '../pages/admin/AdminSaaSPage';
import AdminFinancePage from '../pages/admin/AdminFinancePage';
import AdminSupportPage from '../pages/admin/AdminSupportPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';
import AdminPendingOrdersPage from '../pages/admin/AdminPendingOrdersPage';

// Simple placeholders for now
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuthStore();

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-bold animate-pulse">Chargement de votre session...</p>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
        children: [
            { path: '/', element: <DashboardPage /> },
            { path: '/services', element: <ServicesPage /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/wallet', element: <WalletPage /> },
            { path: '/white-label', element: <WhiteLabelPage /> },
            { path: '/referrals', element: <ReferralsPage /> },
            { path: '/api-keys', element: <ApiKeysPage /> },
            { path: '/settings', element: <SettingsPage /> },
            { path: '/support', element: <SupportPage /> },
            { path: '/docs', element: <DocumentationPage /> },
        ],
    },
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/register',
        element: <RegisterPage />,
    },
    {
        path: '/admin',
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        children: [
            { path: 'dashboard', element: <AdminDashboard /> },
            { path: 'users', element: <AdminUsersPage /> },
            { path: 'orders', element: <AdminOrdersPage /> },
            { path: 'saas', element: <AdminSaaSPage /> },
            { path: 'finance', element: <AdminFinancePage /> },
            { path: 'support', element: <AdminSupportPage /> },
            { path: 'settings', element: <AdminSettingsPage /> },
            { path: 'pending-boosts', element: <AdminPendingOrdersPage /> },
            // Add other admin routes here as we create pages
            { path: '*', element: <div className="text-white p-10">Page en construction</div> }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />,
    }
]);
