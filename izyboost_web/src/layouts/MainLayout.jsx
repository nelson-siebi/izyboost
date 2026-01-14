import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    LayoutDashboard,
    ShoppingCart,
    Wallet,
    Settings,
    LifeBuoy,
    LogOut,
    User,
    Menu,
    X,
    Bell,
    Search,
    ChevronRight,
    History,
    Globe,
    Share2,
    Key,
    ExternalLink,
    MoreHorizontal,
    Plus,
    CreditCard,
    ShieldCheck,
    Youtube
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import NotificationDropdown from '../features/notifications/NotificationDropdown';

import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import WhatsAppButton from '../components/WhatsAppButton';
import { adminApi } from '../features/admin/adminApi';
import apiClient from '../api/client';

export default function MainLayout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isPlusOpen, setIsPlusOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [siteLogo, setSiteLogo] = useState(null);
    const dropdownRef = useRef(null);

    const primaryItems = [
        { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Nouveau Boost', icon: ShoppingCart, path: '/dashboard/services' },
        { label: 'Historique', icon: History, path: '/dashboard/orders' },
        { label: 'Portefeuille', icon: Wallet, path: '/dashboard/wallet' },
    ];

    const [ytLink, setYtLink] = useState('https://youtube.com');

    const secondaryItems = [
        { label: 'Mon Business', icon: Globe, path: '/dashboard/white-label' },
        { label: 'Affiliation', icon: Share2, path: '/dashboard/referrals' },
        { label: 'Tutos YouTube', icon: Youtube, path: ytLink, external: true },
        { label: 'API Développeurs', icon: Key, path: '/dashboard/api-keys' },
        { label: 'Support Client', icon: LifeBuoy, path: '/dashboard/support' },
        { label: 'Paramètres', icon: Settings, path: '/dashboard/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/auth/login');
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsPlusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu and scroll to top on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // Fetch site logo & social links
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminApi.getSettings();
                const logoSetting = data.find(s => s.key === 'site_logo');
                if (logoSetting?.value) setSiteLogo(logoSetting.value);

                const ytSetting = data.find(s => s.key === 'youtube_link');
                if (ytSetting?.value) setYtLink(ytSetting.value);
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-x-hidden">
            {/* Premium Fixed Header - Clean & White */}
            <header className="h-20 lg:h-24 fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-[100] border-b border-slate-200/50 shadow-sm transition-all duration-300">
                <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between relative">
                    {/* Section Gauche : Logo */}
                    <div className="flex items-center gap-4 lg:gap-6 z-10">
                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <Link to="/" className="flex items-center group">
                            {siteLogo ? (
                                <img
                                    src={resolveImgUrl(siteLogo)}
                                    alt="Logo"
                                    className="h-8 lg:h-9 w-auto max-w-[120px] object-contain group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                <img
                                    src="/logo1.png"
                                    alt="IzyBoost"
                                    className="h-8 lg:h-9 w-auto max-w-[120px] object-contain group-hover:scale-105 transition-transform"
                                />
                            )}
                        </Link>
                    </div>

                    {/* Section Centre : Navigation Desktop */}
                    <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                        {primaryItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "px-4 py-2 rounded-2xl flex items-center transition-all duration-300 gap-2 font-black text-[11px] uppercase tracking-widest relative group/nav",
                                        isActive ? "text-brand-primary" : "text-slate-400 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon size={16} className={cn("transition-transform group-hover/nav:scale-110", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 bg-brand-primary rounded-full shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)] transition-all duration-300"
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        {/* Plus Dropdown - Compact */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsPlusOpen(!isPlusOpen)}
                                className={cn(
                                    "px-4 py-2 rounded-2xl flex items-center transition-all duration-300 gap-2 font-black text-[11px] uppercase tracking-widest group/nav",
                                    isPlusOpen ? "text-slate-900" : "text-slate-400 hover:text-slate-900"
                                )}
                            >
                                <MoreHorizontal size={16} />
                                <span>Plus</span>
                            </button>

                            {isPlusOpen && (
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-50 overflow-hidden animate-[fade-in-up_0.2s_ease-out]"
                                >
                                    <div className="grid grid-cols-1 gap-1">
                                        {secondaryItems.map((item) => (
                                            item.external ? (
                                                <a
                                                    key={item.label}
                                                    href={item.path}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                        <item.icon size={14} />
                                                    </div>
                                                    <span className="font-bold text-xs text-slate-700 group-hover:text-slate-900">{item.label}</span>
                                                    <ExternalLink size={10} className="ml-auto text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ) : (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setIsPlusOpen(false)}
                                                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="h-8 w-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                        <item.icon size={14} />
                                                    </div>
                                                    <span className="font-bold text-xs text-slate-700 group-hover:text-slate-900">{item.label}</span>
                                                </Link>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Section Droite : Actions Utilisateur */}
                    <div className="flex items-center gap-3 z-10">
                        {/* Notifications */}
                        <NotificationDropdown />

                        {/* Balance Card - Compact */}
                        <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-2xl p-1 pr-3 shadow-sm group cursor-pointer hover:border-brand-primary/30 transition-all"
                            onClick={() => navigate('/dashboard/wallet')}>
                            <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                                <Wallet size={14} strokeWidth={2.5} />
                            </div>
                            <div className="ml-2.5 text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Solde</p>
                                <p className="text-xs font-black text-slate-900 mt-0.5">{Number(user?.balance || 0).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} <span className="text-[10px] text-brand-primary">F</span></p>
                            </div>
                        </div>

                        {/* Profile - Slim */}
                        <div className="hidden lg:flex items-center bg-white border border-slate-200 rounded-2xl p-1 pr-3 shadow-sm group hover:border-brand-primary/30 transition-all cursor-pointer" onClick={() => navigate('/dashboard/settings')}>
                            <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="font-black text-slate-400 text-[10px] uppercase">{user?.username?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="ml-2 hidden xl:block">
                                <p className="text-xs font-black text-slate-900 leading-none">{user?.username || 'Client'}</p>
                            </div>
                        </div>

                        {/* Logout - Subtle */}
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="Déconnexion"
                        >
                            <LogOut size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </header>





            {/* Mobile Sidebar (Drawer) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[150] lg:hidden animate-[fade-in_0.2s_ease-out]"
                >
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div
                        className="absolute top-0 bottom-0 left-0 w-[280px] bg-white shadow-2xl p-6 overflow-y-auto animate-[slide-in-left_0.3s_ease-out]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                {siteLogo ? (
                                    <img
                                        src={resolveImgUrl(siteLogo)}
                                        alt="Logo"
                                        className="h-10 w-auto max-w-[150px] object-contain"
                                    />
                                ) : (
                                    <img
                                        src="/logo1.png"
                                        alt="Logo"
                                        className="h-10 w-auto max-w-[150px] object-contain"
                                    />
                                )}
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Menu Principal</p>
                                <div className="space-y-1">
                                    {primaryItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm",
                                                    isActive ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20" : "text-slate-500 hover:bg-slate-50"
                                                )}
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Autres</p>
                                <div className="space-y-1">
                                    {secondaryItems.map((item) => (
                                        item.external ? (
                                            <a
                                                key={item.label}
                                                href={item.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </a>
                                        ) : (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </Link>
                                        )
                                    ))}
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-amber-600 bg-amber-50 hover:bg-amber-100"
                                        >
                                            <ShieldCheck size={18} />
                                            Administration
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-bold text-sm w-full">
                                <LogOut size={18} />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <main className="flex-1 min-w-0 bg-pattern pt-20 lg:pt-24">
                <ScrollToTop />
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8 lg:py-12 min-h-[60vh]">
                    <Outlet />
                </div>
            </main >

            <Footer />
            <WhatsAppButton />

            {/* Mobile Bottom Navigation - Restyled */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[60]">
                <nav className="h-[72px] bg-slate-900/90 backdrop-blur-xl rounded-[28px] border border-white/5 flex items-center justify-between px-2 text-white shadow-2xl shadow-slate-900/30">
                    {primaryItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center w-full h-full group"
                            >
                                {isActive && (
                                    <div
                                        className="absolute -top-10 mb-1"
                                    >
                                        <div className="h-1 w-8 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]" />
                                    </div>
                                )}
                                <div className={cn(
                                    "p-2.5 rounded-2xl transition-all duration-300",
                                    isActive ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/25 translate-y-[-4px]" : "text-slate-400 group-hover:text-white"
                                )}>
                                    <item.icon size={20} className={cn(isActive && "fill-current")} />
                                </div>
                            </Link>
                        );
                    })}
                    <Link
                        to="/dashboard/settings"
                        className="relative flex flex-col items-center justify-center w-full h-full group"
                    >
                        <div className={cn(
                            "p-2.5 rounded-2xl transition-all duration-300 text-slate-400 group-hover:text-white",
                            location.pathname === '/dashboard/settings' && "bg-slate-800 text-white"
                        )}>
                            <Settings size={20} />
                        </div>
                    </Link>
                </nav>
            </div>
        </div >
    );
}
