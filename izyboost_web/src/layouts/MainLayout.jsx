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
    MoreHorizontal,
    Plus,
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../utils/cn';
import NotificationDropdown from '../features/notifications/NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export default function MainLayout() {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isPlusOpen, setIsPlusOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const primaryItems = [
        { label: 'Tableau de bord', icon: LayoutDashboard, path: '/' },
        { label: 'Nouveau Boost', icon: ShoppingCart, path: '/services' },
        { label: 'Historique', icon: History, path: '/orders' },
        { label: 'Portefeuille', icon: Wallet, path: '/wallet' },
    ];

    const secondaryItems = [
        { label: 'Marque Blanche', icon: Globe, path: '/white-label' },
        { label: 'Affiliation', icon: Share2, path: '/referrals' },
        { label: 'API Développeurs', icon: Key, path: '/api-keys' },
        { label: 'Support Client', icon: LifeBuoy, path: '/support' },
        { label: 'Paramètres', icon: Settings, path: '/settings' },
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

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 overflow-x-hidden">
            {/* Modern Top Header - Fixed & Full Width */}
            <header className="h-20 lg:h-24 px-6 lg:px-16 flex items-center justify-between sticky top-0 bg-[#F8FAFC]/95 backdrop-blur-2xl z-[100] border-b border-slate-200/50 shadow-sm transition-all duration-300">
                <div className="flex items-center space-x-6 lg:space-x-10">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center group">
                        <div className="h-9 w-9 lg:h-10 lg:w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
                            IZ
                        </div>
                        <span className="ml-3 font-black text-xl lg:text-2xl tracking-tighter text-slate-900 hidden sm:block">
                            IZY<span className="text-brand-primary">BOOST</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden xl:flex items-center space-x-1">
                        {primaryItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "px-4 py-2.5 rounded-2xl flex items-center transition-all duration-300 gap-2.5 font-bold text-[13px] tracking-tight",
                                        isActive
                                            ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                                            : "text-slate-500 hover:bg-white hover:text-brand-primary"
                                    )}
                                >
                                    <item.icon size={16} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Plus Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsPlusOpen(!isPlusOpen)}
                                className={cn(
                                    "px-4 py-2.5 rounded-2xl flex items-center transition-all duration-300 gap-2.5 font-bold text-[13px] tracking-tight",
                                    isPlusOpen ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-white hover:text-brand-primary"
                                )}
                            >
                                <MoreHorizontal size={16} />
                                <span>Plus</span>
                            </button>

                            <AnimatePresence>
                                {isPlusOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-3 z-50 overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 gap-1">
                                            {secondaryItems.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => setIsPlusOpen(false)}
                                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                                        <item.icon size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900">{item.label}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>
                </div>

                <div className="flex items-center space-x-3 lg:space-x-6">
                    {/* Search Bar Refined */}
                    <div className={cn(
                        "hidden md:flex items-center px-5 py-2.5 rounded-2xl transition-all duration-300 w-64 lg:w-72 border-2",
                        isSearchFocused
                            ? "bg-white border-brand-primary/20 shadow-xl shadow-brand-primary/5 translate-y-[-1px]"
                            : "bg-slate-200/50 border-transparent"
                    )}>
                        <Search size={18} className={cn("transition-colors", isSearchFocused ? "text-brand-primary" : "text-slate-400")} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/services?search=${e.target.value}`)}
                            className="bg-transparent border-none outline-none ml-3 text-sm font-bold w-full placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        {/* Notifications */}
                        <NotificationDropdown />

                        <div className="hidden sm:flex items-center bg-brand-primary/[0.03] border border-brand-primary/10 rounded-2xl p-1.5 pr-4 pl-1.5 shadow-sm group cursor-pointer hover:border-brand-primary/20 transition-all ml-2"
                            onClick={() => navigate('/wallet')}>
                            <div className="h-8 w-8 rounded-xl bg-brand-primary flex items-center justify-center text-white font-black group-hover:scale-95 transition-transform">
                                <Plus size={16} />
                            </div>
                            <div className="ml-3 text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Solde</p>
                                <p className="text-sm font-black text-slate-900 mt-0.5">{user?.balance || 0} <span className="text-[10px] text-brand-primary">FCFA</span></p>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center bg-white border border-slate-200 rounded-2xl p-1.5 pr-4 pl-1.5 shadow-sm group cursor-pointer hover:border-brand-primary/20 transition-all">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:scale-95 transition-transform overflow-hidden capitalize">
                                {user?.username?.charAt(0) || <User size={18} />}
                            </div>
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-black text-slate-900 truncate max-w-[100px]">{user?.username || 'Client'}</p>
                            </div>
                        </div>

                        {user?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="p-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-all active:scale-90 shadow-sm shadow-amber-900/5 group"
                                title="Administration"
                            >
                                <ShieldCheck size={20} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="hidden lg:flex p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div key="mobile-menu-portal" className="fixed inset-0 z-[150] lg:hidden">
                        <motion.div
                            key="mobile-menu-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            key="mobile-menu-content"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            className="absolute top-0 bottom-0 left-0 w-[280px] bg-white shadow-2xl p-6 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black">
                                        IZ
                                    </div>
                                    <span className="font-black text-xl text-slate-900">IzyBoost</span>
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
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            >
                                                <item.icon size={18} />
                                                {item.label}
                                            </Link>
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Content Container */}
            <main className="flex-1 min-w-0 bg-pattern">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-12 min-h-[60vh]">
                    <Outlet />
                </div>
            </main>

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
                                    <motion.div
                                        layoutId="mobileNavActive"
                                        className="absolute -top-10 mb-1"
                                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                                    >
                                        <div className="h-1 w-8 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(var(--brand-primary-rgb),0.5)]" />
                                    </motion.div>
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
                        to="/settings"
                        className="relative flex flex-col items-center justify-center w-full h-full group"
                    >
                        <div className={cn(
                            "p-2.5 rounded-2xl transition-all duration-300 text-slate-400 group-hover:text-white",
                            location.pathname === '/settings' && "bg-slate-800 text-white"
                        )}>
                            <Settings size={20} />
                        </div>
                    </Link>
                </nav>
            </div>
        </div>
    );
}
