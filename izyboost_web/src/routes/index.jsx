import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuthStore } from '../store/useAuthStore';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import DashboardPage from '../pages/Dashboard';
import WalletPage from '../pages/WalletPage';
import OrdersPage from '../pages/OrdersPage';

import WhiteLabelPage from '../pages/WhiteLabelPage';
import ReferralsPage from '../pages/ReferralsPage';

import ServicesPage from '../pages/ServicesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ErrorPage from '../components/ErrorPage';

import ApiKeysPage from '../pages/ApiKeysPage';
import SupportPage from '../pages/SupportPage';

import SettingsPage from '../pages/SettingsPage';
import DocumentationPage from '../pages/DocumentationPage';

// Public Pages
import LandingLayout from '../layouts/LandingLayout';
import LandingPage from '../pages/LandingPage';
import ContactPage from '../pages/ContactPage';

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
import AdminFailedOrdersPage from '../pages/admin/AdminFailedOrdersPage';
import AdminServicesPage from '../pages/admin/AdminServicesPage';

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

const RedirectWithSearch = ({ to }) => {
    const { search } = useLocation();
    return <Navigate to={`${to}${search}`} replace />;
};

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingLayout />,
        errorElement: <ErrorPage />,
        children: [
            { path: '/', element: <LandingPage /> },
            { path: '/contact', element: <ContactPage /> },
            { path: '/docs', element: <DocumentationPage /> },
            { path: '/reset-password', element: <RedirectWithSearch to="/auth/reset-password" /> },
            { path: '/register', element: <RedirectWithSearch to="/auth/register" /> }, // Support old referral links
        ],
    },
    {
        path: '/dashboard',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
        errorElement: <ErrorPage />,
        children: [
            { path: '', element: <DashboardPage /> },
            { path: 'services', element: <ServicesPage /> },
            { path: 'orders', element: <OrdersPage /> },
            { path: 'wallet', element: <WalletPage /> },
            { path: 'white-label', element: <WhiteLabelPage /> },
            { path: 'referrals', element: <ReferralsPage /> },
            { path: 'api-keys', element: <ApiKeysPage /> },
            { path: 'settings', element: <SettingsPage /> },
            { path: 'support', element: <SupportPage /> },
        ],
    },
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    // ... rest remains same but I will include the whole block for safety if possible or just the relevant parts
    {
        path: '/auth/register',
        element: <RegisterPage />,
    },
    {
        path: '/auth/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/auth/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/admin',
        // ...
        element: <AdminRoute><AdminLayout /></AdminRoute>,
        errorElement: <ErrorPage />,
        children: [
            { path: 'dashboard', element: <AdminDashboard /> },
            { path: 'users', element: <AdminUsersPage /> },
            { path: 'orders', element: <AdminOrdersPage /> },
            { path: 'saas', element: <AdminSaaSPage /> },
            { path: 'finance', element: <AdminFinancePage /> },
            { path: 'support', element: <AdminSupportPage /> },
            { path: 'settings', element: <AdminSettingsPage /> },
            { path: 'services', element: <AdminServicesPage /> },
            { path: 'pending-boosts', element: <AdminPendingOrdersPage /> },
            { path: 'failed-orders', element: <AdminFailedOrdersPage /> },
            // Add other admin routes here as we create pages
            { path: '*', element: <div className="text-white p-10">Page en construction</div> }
        ]
    },
    {
        path: '*',
        element: <NotFoundPage />,
    }
]);
