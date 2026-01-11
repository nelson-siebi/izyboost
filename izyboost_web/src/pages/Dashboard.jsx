import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Wallet, Zap, TrendingUp, ShoppingCart,
    Star, Globe, Share2, LifeBuoy, Plus, ChevronRight,
    AlertCircle, Instagram, Facebook, Twitter, Youtube, Linkedin, Twitch, Code
} from 'lucide-react';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import { useAuthStore } from '../store/useAuthStore';
import RecentOrders from '../features/dashboard/RecentOrders';
import { cn } from '../utils/cn';
import JoinCommunityModal from '../components/JoinCommunityModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedService, setSelectedService] = useState(null);
    const [quickOrder, setQuickOrder] = useState({ link: '', quantity: '' });
    const [placingOrder, setPlacingOrder] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await dashboardApi.getStats();
            console.log('Dashboard Data:', data);
            setData(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickOrder = async (e) => {
        e.preventDefault();
        setFormErrors({});

        if (!selectedService || !quickOrder.link || !quickOrder.quantity) {
            setFormErrors({ general: 'Veuillez remplir tous les champs' });
            return;
        }

        setPlacingOrder(true);
        try {
            await dashboardApi.placeOrder({
                service_id: selectedService.id,
                link: quickOrder.link,
                quantity: parseInt(quickOrder.quantity)
            });

            setQuickOrder({ link: '', quantity: '' });
            setSelectedService(null);
            loadDashboard();
        } catch (error) {
            setFormErrors({ general: error.response?.data?.message || 'Erreur lors de la commande' });
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    const PLATFORM_CONFIG = {
        instagram: { icon: Instagram, color: 'text-[#E4405F]', bg: 'bg-rose-50' },
        facebook: { icon: Facebook, color: 'text-[#1877F2]', bg: 'bg-blue-50' },
        twitter: { icon: Twitter, color: 'text-[#1DA1F2]', bg: 'bg-sky-50' },
        x: { icon: Twitter, color: 'text-[#1DA1F2]', bg: 'bg-sky-50' },
        youtube: { icon: Youtube, color: 'text-[#FF0000]', bg: 'bg-red-50' },
        linkedin: { icon: Linkedin, color: 'text-[#0A66C2]', bg: 'bg-indigo-50' },
        twitch: { icon: Twitch, color: 'text-[#9146FF]', bg: 'bg-purple-50' },
        tiktok: {
            icon: ({ size, className }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
            ),
            color: 'text-slate-900',
            bg: 'bg-slate-100'
        },
        spotify: {
            icon: ({ size, className }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M8 14.5c2.5-1 5.5-1 8 0" /><path d="M6.5 11.5c3.5-1.5 7.5-1.5 11 0" /><path d="M5 8.5c4.5-2 9.5-2 14 0" /></svg>
            ),
            color: 'text-[#1DB954]',
            bg: 'bg-emerald-50'
        },
        telegram: {
            icon: ({ size, className }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            ),
            color: 'text-[#229ED9]',
            bg: 'bg-cyan-50'
        },
        snapchat: {
            icon: ({ size, className }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3c-1.2 0-2.4.3-3.6 1-1.2.6-2 1.6-2.4 2.8-.2.5-.2 1-.2 1.5l.3 3.5c0 .3 0 .6-.2.8-.2.2-.5.3-.8.3-1 0-2 .4-2.8 1.2s-1.2 1.8-1.2 2.8c0 1.2.5 2.4 1.4 3.2.8.8 2 1.3 3.2 1.3.3 0 .6.1.8.3s.3.5.3.8-1.1 2.3-1.1 2.3-.2.3 0 .6c.1.2.3.4.6.4h11.4c.3 0 .5-.2.6-.4.1-.3 0-.6 0-.6s-1.1-2.3-1.1-2.3c0-.3.1-.6.3-.8s.5-.3.8-.3c1.2 0 2.4-.5 3.2-1.3.9-.8 1.4-2 1.4-3.2 0-1-.4-2-1.2-2.8s-1.8-1.2-2.8-1.2c-.3 0-.6-.1-.8-.3-.2-.2-.3-.5-.3-.8l.3-3.5c0-.5 0-1-.2-1.5-.4-1.2-1.2-2.2-2.4-2.8C14.4 3.3 13.2 3 12 3z" /></svg>
            ),
            color: 'text-yellow-600',
            bg: 'bg-yellow-50'
        },
        pinterest: {
            icon: ({ size, className }) => (
                <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 8c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" /><path d="M12 12c0 3-1 4-1 6" /></svg>
            ),
            color: 'text-[#BD081C]',
            bg: 'bg-red-50'
        }
    };

    const getPlatformData = (slug) => {
        if (!slug) return { icon: Globe, color: 'text-slate-400', bg: 'bg-slate-50' };
        const normalizedSlug = slug.toLowerCase();

        // Exact match
        if (PLATFORM_CONFIG[normalizedSlug]) return PLATFORM_CONFIG[normalizedSlug];

        // Partial match
        const key = Object.keys(PLATFORM_CONFIG).find(k => normalizedSlug.includes(k));
        return key ? PLATFORM_CONFIG[key] : { icon: Globe, color: 'text-brand-primary', bg: 'bg-brand-primary/5' };
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Container with responsive padding */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8">

                {/* Hero Section - Responsive Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Greeting & Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:col-span-7"
                    >
                        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="space-y-6">
                                {/* Greeting */}
                                <div>
                                    <p className="text-brand-primary text-xs sm:text-sm font-semibold mb-2">Bienvenue sur IzyBoost</p>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                        Bonjour, {user?.username} 
                                    </h1>
                                </div>

                                {/* Stats Grid - Responsive */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                                    {[
                                        { label: 'Commandes', value: data.summary.totalOrders, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Points VIP', value: 'Gold', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
                                        { label: 'Statut', value: 'Actif', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
                                    ].map((stat) => (
                                        <div key={stat.label} className="space-y-2">
                                            <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                                                <stat.icon size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase">{stat.label}</p>
                                                <p className="text-lg sm:text-xl font-bold text-slate-900">{stat.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Balance Card - Responsive */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="lg:col-span-5"
                    >
                        <div
                            onClick={() => navigate('/dashboard/wallet')}
                            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer h-full flex flex-col justify-between min-h-[200px] sm:min-h-[240px]"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                                    <Wallet size={24} className="sm:w-7 sm:h-7" strokeWidth={2} />
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-[10px] sm:text-xs font-semibold">
                                    Solde
                                </div>
                            </div>

                            {/* Balance Amount */}
                            <div className="mt-auto">
                                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-2">Montant Disponible</p>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight flex items-baseline gap-2 flex-wrap">
                                    {Number(data.summary.balance).toLocaleString('fr-FR', { maximumFractionDigits: 0 })}
                                    <span className="text-base sm:text-lg text-brand-primary font-bold">XAF</span>
                                </h2>

                                {/* Recharge Button */}
                                <div className="mt-4 sm:mt-6 flex items-center gap-2 text-brand-primary font-semibold text-sm hover:gap-3 transition-all">
                                    <span>Recharger</span>
                                    <Plus size={16} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Search Bar - Full Width Responsive */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className="bg-white h-14 sm:h-16 lg:h-20 rounded-xl sm:rounded-2xl border border-slate-200 p-2 sm:p-3 flex items-center gap-3 sm:gap-4 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0">
                            <Search size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un service..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchQuery && navigate(`/dashboard/services?search=${searchQuery}`)}
                            className="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 placeholder:text-slate-400 text-sm sm:text-base lg:text-lg"
                        />
                        <button
                            onClick={() => searchQuery && navigate(`/dashboard/services?search=${searchQuery}`)}
                            className="h-10 sm:h-12 lg:h-14 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm uppercase tracking-wide hover:bg-brand-primary transition-all active:scale-95 shadow-md flex-shrink-0"
                        >
                            <span className="hidden sm:inline">Explorer</span>
                            <Search size={16} className="sm:hidden" />
                        </button>
                    </div>
                </motion.div>

                {/* Marquee Section with Real Logos & Colors */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <div className="space-y-4">
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 px-2">Nos Catégories</h2>
                        <div className="relative w-full overflow-hidden mask-linear-fade">
                            {/* Gradient Masks for smooth edges */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

                            <div className="flex w-max animate-marquee hover:[animation-play-state:paused] py-2">
                                {/* Duplicate list for seamless loop */}
                                {[...(data.platforms || []), ...(data.platforms || [])].map((platform, index) => {
                                    const { icon: Icon, color, bg } = getPlatformData(platform.slug);
                                    return (
                                        <button
                                            key={`${platform.id}-${index}`}
                                            onClick={() => navigate(`/dashboard/services?network=${platform.slug}`)}
                                            className="mx-2 sm:mx-3 flex-shrink-0 w-32 sm:w-40 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all active:scale-95 group"
                                        >
                                            <div className="flex flex-col items-center gap-2 sm:gap-3">
                                                <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110", bg, color)}>
                                                    <Icon size={20} className="sm:w-6 sm:h-6" />
                                                </div>
                                                <span className="text-xs sm:text-sm font-bold text-slate-700 text-center line-clamp-1 group-hover:text-slate-900 whitespace-nowrap">
                                                    {platform.name}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate('/dashboard/services')}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all group text-left"
                    >
                        <div className="bg-brand-primary/5 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-brand-primary mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Ma Boutique</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">Commander des services</p>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/referrals')}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all group text-left"
                    >
                        <div className="bg-emerald-50 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-emerald-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                            <Share2 size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Affiliation</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">Gagner de l'argent</p>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/support')}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all group text-left"
                    >
                        <div className="bg-blue-50 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                            <LifeBuoy size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Support</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">Besoin d'aide ?</p>
                    </button>

                    <button
                        onClick={() => navigate('/dashboard/api-keys')}
                        className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all group text-left"
                    >
                        <div className="bg-purple-50 h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-purple-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                            <Code size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Développeurs</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">Documentation API</p>
                    </button>
                </div>

                {/* Quick Boost & Activity Row - Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* Quick Boost Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="lg:col-span-8"
                    >
                        <div className="h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                            {/* Form Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                                        <Zap size={22} className="fill-brand-primary/20" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Boost Rapide ⚡</h2>
                                        <p className="text-xs text-slate-500">Commande instantanée</p>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {selectedService && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 sm:px-4 py-2 rounded-xl border border-emerald-100"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-semibold whitespace-nowrap">Service actif</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleQuickOrder} className="space-y-4 sm:space-y-6">
                                {/* Service Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Service</label>
                                    <select
                                        value={selectedService?.id || ''}
                                        onChange={(e) => {
                                            const service = data.services.find(s => s.id === parseInt(e.target.value));
                                            setSelectedService(service);
                                        }}
                                        className="w-full h-12 sm:h-14 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                                    >
                                        <option value="">Sélectionner un service</option>
                                        {Object.entries(
                                            data.services.reduce((acc, service) => {
                                                const platform = service.platform?.name || 'Autres';
                                                if (!acc[platform]) acc[platform] = [];
                                                acc[platform].push(service);
                                                return acc;
                                            }, {})
                                        ).map(([platform, services]) => (
                                            <optgroup key={platform} label={platform}>
                                                {services.map(service => (
                                                    <option key={service.id} value={service.id}>
                                                        {service.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>

                                {/* Service Details Info Panel */}
                                <AnimatePresence>
                                    {selectedService && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Prix p/1</p>
                                                    <p className="text-sm font-bold text-brand-primary">
                                                        {(parseFloat(selectedService.base_price_per_unit) || (parseFloat(selectedService.rate) / 1000) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px]">XAF</span>
                                                    </p>
                                                </div>
                                                <div className="space-y-1 border-x border-slate-200 px-2 sm:px-4">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Min</p>
                                                    <p className="text-sm font-bold text-slate-700">{selectedService.min_quantity?.toLocaleString()}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase font-bold text-slate-400">Max</p>
                                                    <p className="text-sm font-bold text-slate-700">{selectedService.max_quantity?.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Link & Quantity - Responsive Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Lien</label>
                                        <input
                                            type="text"
                                            value={quickOrder.link}
                                            onChange={(e) => setQuickOrder({ ...quickOrder, link: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full h-12 sm:h-14 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Quantité</label>
                                        <input
                                            type="number"
                                            value={quickOrder.quantity}
                                            onChange={(e) => setQuickOrder({ ...quickOrder, quantity: e.target.value })}
                                            placeholder={`Ex: ${selectedService?.min_quantity || 1000}`}
                                            className="w-full h-12 sm:h-14 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Price Display */}
                                {selectedService && quickOrder.quantity && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white shadow-lg"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total à payer</span>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-brand-primary">
                                                    {Math.ceil(
                                                        (parseFloat(selectedService.base_price_per_unit) || (parseFloat(selectedService.rate) / 1000) || 0) *
                                                        (parseInt(quickOrder.quantity) || 0)
                                                    ).toLocaleString('fr-FR')}
                                                    <span className="text-sm ml-2">XAF</span>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!selectedService || !quickOrder.link || !quickOrder.quantity || placingOrder}
                                    className="w-full h-12 sm:h-14 bg-slate-900 text-white font-semibold rounded-xl hover:bg-brand-primary disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    {placingOrder ? (
                                        <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Lancer le Boost</span>
                                            <Zap size={18} className="fill-current" />
                                        </>
                                    )}
                                </button>

                                {/* Error Display */}
                                <AnimatePresence>
                                    {formErrors.general && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="flex items-center gap-2 text-red-600 text-sm font-medium bg-red-50 px-4 py-3 rounded-xl border border-red-100"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{formErrors.general}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>

                    {/* Recent Orders - Responsive Sidebar on Desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="lg:col-span-4"
                    >
                        <div className="h-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">Activité Récente</h2>
                                <button
                                    onClick={() => navigate('/dashboard/orders')}
                                    className="text-[10px] font-black uppercase text-brand-primary tracking-widest hover:bg-brand-primary/5 px-2 py-1 rounded"
                                >
                                    Voir tout
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <RecentOrders orders={data.recentOrders} limit={6} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Join Community Modal */}
            <JoinCommunityModal />
        </div>
    );
}
