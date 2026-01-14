import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    Globe,
    CreditCard,
    LifeBuoy,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    LogOut,
    ChevronRight,
    User,
    Package,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { adminApi } from '../features/admin/adminApi';

import { cn } from '../utils/cn';
import WhatsAppButton from '../components/WhatsAppButton';
import apiClient from '../api/client';
import NotificationDropdown from '../features/notifications/NotificationDropdown';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [settings, setSettings] = useState({ site_logo: null });

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminApi.getSettings();
                const logoSetting = data.find(s => s.key === 'site_logo');
                if (logoSetting) setSettings(prev => ({ ...prev, site_logo: logoSetting.value }));
            } catch (err) {
                console.error("Failed to fetch admin settings", err);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
        { label: 'Utilisateurs', icon: Users, path: '/admin/users' },
        { label: 'Commandes', icon: ShoppingCart, path: '/admin/orders' },
        { label: 'En attente', icon: Clock, path: '/admin/pending-boosts' },
        { label: 'Échecs API', icon: AlertTriangle, path: '/admin/failed-orders' },
        { label: 'Offres SaaS', icon: Globe, path: '/admin/saas' },
        { label: 'Services SMM', icon: Package, path: '/admin/services' },
        { label: 'Finances', icon: CreditCard, path: '/admin/finance' },
        { label: 'Support', icon: LifeBuoy, path: '/admin/support' },
        { label: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    // Mobile Bottom Nav Items (Prioritized)
    const mobileBottomItems = [
        { icon: LayoutDashboard, path: '/admin/dashboard', label: 'Home' },
        { icon: Clock, path: '/admin/pending-boosts', label: 'Attente' },
        { icon: ShoppingCart, path: '/admin/orders', label: 'Orders' },
        { icon: Users, path: '/admin/users', label: 'Users' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-50 bg-white border-r border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="flex h-22 shrink-0 items-center px-6 gap-3 border-b border-slate-100 bg-white py-4">
                    {settings.site_logo ? (
                        <div className="flex items-center gap-3">
                            <img src={resolveImgUrl(settings.site_logo)} alt="Logo" className="h-10 w-auto max-w-[180px] object-contain" />
                        </div>
                    ) : (
                        <img src="/logo1.png" alt="Logo" className="h-10 w-auto max-w-[180px] object-contain" />
                    )}
                </div>

                <div className="px-6 py-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-orange-500")} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all group">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-emerald-500/20">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.username || 'Admin'}</p>
                            <p className="text-xs font-medium text-slate-500 truncate">{user?.email}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link to="/settings" className="p-2 text-slate-400 hover:text-orange-500 transition-colors" title="Paramètres du compte">
                                <Settings className="h-4 w-4" />
                            </Link>
                            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Déconnexion">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header - Enhanced */}
            <div className={cn(
                "lg:hidden fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 transition-all duration-300",
                scrolled ? "shadow-md py-2" : "py-3"
            )}>
                <div className="px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {settings.site_logo ? (
                            <img src={resolveImgUrl(settings.site_logo)} alt="Logo" className="h-8 w-auto max-w-[120px] object-contain" />
                        ) : (
                            <img src="/logo1.png" alt="Logo" className="h-8 w-auto max-w-[120px] object-contain" />
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <Bell className="h-5 w-5 text-slate-600" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -mr-2 text-slate-500 hover:text-orange-500 transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay (Hamburger Content) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-[60] lg:hidden animate-[fade-in_0.2s_ease-out]"
                >
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <div
                        className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl flex flex-col animate-[slide-in-right_0.3s_ease-out]"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900">Menu Admin</h2>
                            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-bold transition-all",
                                        location.pathname === item.path
                                            ? "bg-orange-50 text-orange-600 border border-orange-100"
                                            : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", location.pathname === item.path ? "text-orange-500" : "text-slate-400")} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full justify-center px-4 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:pl-72 min-h-screen pb-24 lg:pb-0 pt-20 lg:pt-0 bg-slate-50">
                {/* Desktop Top Bar */}
                <header className="hidden lg:flex sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-2xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all font-bold text-sm group">
                            <Globe size={18} className="group-hover:animate-pulse" />
                            <span>Voir le site</span>
                        </Link>
                        <Link to="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all font-bold text-sm">
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationDropdown />
                        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-orange-500 transition-all">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            <WhatsAppButton />

            {/* Mobile Bottom Navigation - Robust & Visible */}
            <div className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 py-3 px-4 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
                <nav className="flex items-center justify-between max-w-sm mx-auto">
                    {mobileBottomItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-16 group"
                            >
                                {isActive && (
                                    <div
                                        className="absolute -top-3 h-1 w-8 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                                    />
                                )}
                                <div className={cn(
                                    "p-1.5 rounded-xl transition-all duration-300",
                                    isActive ? "bg-orange-50" : "bg-transparent group-hover:bg-slate-50"
                                )}>
                                    <item.icon
                                        className={cn(
                                            "h-6 w-6 transition-colors duration-200",
                                            isActive ? "text-orange-600 fill-orange-500/10" : "text-slate-400"
                                        )}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold mt-1 transition-colors",
                                    isActive ? "text-orange-600" : "text-slate-400"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
