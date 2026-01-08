import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Music, // TikTok placeholder
    Heart,
    UserPlus,
    Play,
    Share2,
    Zap,
    Star,
    ChevronRight,
    Search,
    Users,
    ShoppingCart,
    Wallet,
    Globe,
    LifeBuoy,
    Plus,
    AlertCircle
} from 'lucide-react';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import { useAuthStore } from '../store/useAuthStore';
import StatCard from '../features/dashboard/StatCard';
import RecentOrders from '../features/dashboard/RecentOrders';
import { cn } from '../utils/cn';

const TikTokIcon = (props) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        {...props}
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.09-.26-.17-.39-.26-.41-.29-.81-.62-1.15-1 .1 1.78.07 3.56.07 5.33 0 2.45-.64 4.85-2.2 6.74-1.57 1.95-3.95 3.06-6.43 3.12-2.32.06-4.67-.6-6.52-2.02-1.85-1.43-2.99-3.62-2.95-5.94.03-2.4 1.25-4.66 3.25-5.98 1.83-1.2 4.13-1.6 6.27-1.11V7.12c-1.35-.45-2.88-.28-4.1.47-1.22.76-2.04 2.1-2.14 3.52-.11 1.54.55 3.08 1.69 4.11 1.14 1.03 2.76 1.48 4.28 1.23 1.52-.25 2.89-1.24 3.58-2.61.64-1.28.8-2.73.74-4.15V.02h.1z" />
    </svg>
);

const SOCIAL_NETWORKS = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-[#f09433] to-[#bc1888]' },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'from-[#000000] to-[#25F4EE]' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-[#1877F2] to-[#00A3FF]' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-[#FF0000] to-[#CC0000]' },
    { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'from-[#000000] to-[#404040]' },
    { id: 'linkedin', name: 'LinkedIn', icon: Users, color: 'from-[#0077B5] to-[#00A0DC]' },
];

export default function DashboardPage() {
    const [data, setData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [groupedNetworks, setGroupedNetworks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { setUser, user } = useAuthStore();
    const navigate = useNavigate();

    // Quick Order State
    const [quickOrder, setQuickOrder] = useState({
        serviceId: '',
        link: '',
        quantity: '',
    });
    const [placingOrder, setPlacingOrder] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Simple validation helper
    const validateForm = (service) => {
        const errors = {};
        if (!quickOrder.serviceId) errors.serviceId = "Sélectionnez un boost";
        if (!quickOrder.link) errors.link = "Lien requis";
        if (!quickOrder.quantity) {
            errors.quantity = "Quantité requise";
        } else if (service) {
            if (Number(quickOrder.quantity) < service.min_quantity)
                errors.quantity = `Min: ${service.min_quantity}`;
            else if (Number(quickOrder.quantity) > service.max_quantity)
                errors.quantity = `Max: ${service.max_quantity}`;
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Find selected service across all categories
    const selectedService = categories
        .flatMap(c => c.services || [])
        .find(s => s.id.toString() === quickOrder.serviceId);

    const handleQuickOrder = async (e) => {
        e.preventDefault();
        if (!validateForm(selectedService)) return;

        try {
            setPlacingOrder(true);
            await dashboardApi.placeOrder({
                service_id: quickOrder.serviceId,
                link: quickOrder.link,
                quantity: quickOrder.quantity
            });
            // Reset and refresh
            setQuickOrder({ serviceId: '', link: '', quantity: '' });
            setFormErrors({});
            const [updatedStats] = await Promise.all([
                dashboardApi.getStats(),
                new Promise(resolve => setTimeout(resolve, 1000)) // Visual feedback delay
            ]);
            setData(updatedStats);
            alert('Boost lancé avec succès ! 🚀');
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur lors du boost';
            setFormErrors({ general: msg });
        } finally {
            setPlacingOrder(false);
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!data) setLoading(true);
                const [dashboardData, categoriesData] = await Promise.all([
                    dashboardApi.getStats(),
                    dashboardApi.getCategories()
                ]);
                setData(dashboardData);
                setCategories(categoriesData);
                setUser(dashboardData.user);

                // Group only known SOCIAL_NETWORKS
                const uniqueNetworks = [];
                const seenNetworks = new Set();

                SOCIAL_NETWORKS.forEach(network => {
                    const matchedCategories = categoriesData.filter(c =>
                        c.name.toLowerCase().includes(network.id) ||
                        (network.id === 'tiktok' && c.name.toLowerCase().includes('musically'))
                    );

                    if (matchedCategories.length > 0) {
                        seenNetworks.add(network.id);
                        uniqueNetworks.push({
                            ...network,
                            originalCategoryIds: matchedCategories.map(c => c.id)
                        });
                    }
                });

                // Option: Add an "Autres" category if there are unmatched active categories
                const unmatched = categoriesData.filter(c =>
                    ![...seenNetworks].some(id => c.name.toLowerCase().includes(id))
                );

                if (unmatched.length > 0) {
                    uniqueNetworks.push({
                        id: 'others',
                        name: 'Autres Services',
                        icon: Zap,
                        color: 'from-slate-700 to-slate-900',
                        originalCategoryIds: unmatched.map(c => c.id)
                    });
                }

                setGroupedNetworks(uniqueNetworks);

            } catch (err) {
                console.error("Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [setUser]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-4 text-center">
            <AlertCircle size={48} className="text-red-400 mb-2" />
            <p className="text-slate-900 font-bold text-lg">Oups ! Une erreur est survenue.</p>
            <p className="text-slate-500 font-medium text-sm max-w-md">Impossible de charger les données du tableau de bord. Veuillez vérifier votre connexion ou réessayer.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
            >
                Réactualiser la page
            </button>
        </div>
    );

    return (
        <div className="space-y-10 lg:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Premium Mobile App-Like Header */}
            <section className="lg:hidden -mt-6 -mx-4">
                <div className="bg-slate-900 px-6 py-8 rounded-b-[48px] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-primary/5 blur-[40px] -ml-16 -mb-16 rounded-full" />

                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em]">Tableau de Bord</p>
                                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                                    Hello, {user?.username} <span className="animate-bounce">👋</span>
                                </h2>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                <Users size={20} />
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex justify-between items-center group active:scale-[0.98] transition-transform cursor-pointer" onClick={() => navigate('/wallet')}>
                            <div>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Votre Solde Izy</p>
                                <p className="text-3xl font-black text-white tabular-nums">
                                    {data.summary.balance.toLocaleString()} <span className="text-sm font-bold text-brand-primary ml-1">FCFA</span>
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
                                <Plus size={20} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Insights / Stats Strip */}
            <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 px-2">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-brand-primary/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-800 group-hover:scale-110 transition-transform">
                        <ShoppingCart size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commandes</p>
                        <p className="text-xl font-black text-slate-900">{data.summary.totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 group hover:border-brand-primary/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <Star size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Izy</p>
                        <p className="text-xl font-black text-slate-900 italic">Gold VIP</p>
                    </div>
                </div>
                <div className="hidden lg:flex bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm items-center gap-4 group hover:border-brand-primary/20 transition-all">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <Zap size={22} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</p>
                        <p className="text-xl font-black text-slate-900">+5.2%</p>
                    </div>
                </div>
            </section>

            {/* Platform Selection - Infinite Scroll */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-[11px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                        <div className="h-4 w-1 rounded-full bg-brand-primary" />
                        Services de Boost Premium
                    </h2>
                </div>

                <div className="overflow-hidden py-2 -mx-6 lg:-mx-12 group relative">
                    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

                    <div className="flex animate-marquee whitespace-nowrap gap-4 w-fit">
                        {[...groupedNetworks, ...groupedNetworks, ...groupedNetworks].map((network, i) => {
                            const Icon = network.icon;
                            return (
                                <div
                                    key={`${network.id}-${i}`}
                                    onClick={() => navigate(`/services?network=${network.id}`)}
                                    className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm hover:border-brand-primary/30 transition-all cursor-pointer group/card active:scale-95"
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br shadow-md group-hover/card:scale-110 transition-transform",
                                        network.color
                                    )}>
                                        <Icon size={14} />
                                    </div>
                                    <span className="font-black text-slate-800 text-[13px] tracking-tight">{network.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Quick Actions Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {[
                    { label: 'Recharger', icon: Wallet, path: '/wallet', bg: 'bg-emerald-50', text: 'text-emerald-600', sub: 'Add Funds' },
                    { label: 'Store SaaS', icon: Globe, path: '/white-label', bg: 'bg-blue-50', text: 'text-blue-600', sub: 'Ma Boutique' },
                    { label: 'Gains', icon: Share2, path: '/referrals', bg: 'bg-orange-50', text: 'text-orange-600', sub: 'Affiliation' },
                    { label: 'Support', icon: LifeBuoy, path: '/support', bg: 'bg-purple-50', text: 'text-purple-600', sub: 'Help Center' },
                ].map((action, i) => (
                    <motion.div
                        key={action.label}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(action.path)}
                        className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer group hover:shadow-xl hover:shadow-brand-primary/5 transition-all relative overflow-hidden h-full"
                    >
                        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6", action.bg, action.text)}>
                            <action.icon key={`action-icon-${action.label}`} size={26} />
                        </div>
                        <p className="font-black text-slate-900 text-sm tracking-tight mb-1">{action.label}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">{action.sub}</p>

                        {/* Hidden decoration that appears on hover */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </section>

            {/* Simple Quick Boost - Relocated and Redesigned */}
            <section className="px-2">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                            <Zap size={20} className="fill-brand-primary/20" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Boost Eclair ⚡</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lancez un boost en 10 secondes</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Service Select & Small Details */}
                        <div className="lg:col-span-12 space-y-4">
                            <div className={cn(
                                "flex items-center gap-3 px-5 py-4.5 rounded-3xl bg-slate-50 border-2 transition-all duration-300",
                                formErrors.serviceId
                                    ? "border-red-100 bg-red-50/30"
                                    : "border-slate-50 focus-within:border-brand-primary/20 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-brand-primary/5"
                            )}>
                                <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-focus-within:text-brand-primary transition-colors">
                                    <Star size={18} />
                                </div>
                                <div className="flex-1">
                                    <select
                                        value={quickOrder.serviceId}
                                        onChange={(e) => {
                                            setQuickOrder({ ...quickOrder, serviceId: e.target.value });
                                            setFormErrors({ ...formErrors, serviceId: null });
                                        }}
                                        className="w-full bg-transparent border-none font-black text-slate-900 focus:ring-0 focus:outline-none p-0 text-[15px] appearance-none cursor-pointer"
                                    >
                                        <option value="">Sélectionner un service de boost...</option>
                                        {categories.map(cat => (
                                            <optgroup key={cat.id} label={cat.name.toUpperCase()} className="text-[10px] font-black text-slate-400 mt-4 px-2">
                                                {cat.services?.map(srv => (
                                                    <option key={srv.id} value={srv.id} className="text-slate-900 font-bold py-2">{srv.name}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-focus-within:translate-x-1 transition-transform" />
                            </div>

                            {/* Service Badges - Elegant integration */}
                            <AnimatePresence mode="wait">
                                {selectedService && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-wrap gap-3 px-2"
                                    >
                                        <div key={`summary-badge-price-${selectedService.id}`} className="px-4 py-2 bg-brand-primary/[0.03] text-brand-primary rounded-2xl border border-brand-primary/10 flex items-center gap-2 shadow-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Prix Unitaire :</span>
                                            <span className="text-sm font-black">{selectedService.base_price_per_unit.toLocaleString()} FCFA</span>
                                        </div>
                                        <div key={`summary-badge-qty-${selectedService.id}`} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 flex items-center gap-2 shadow-sm">
                                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Quantités :</span>
                                            <span className="text-sm font-black italic">{selectedService.min_quantity.toLocaleString()} — {selectedService.max_quantity.toLocaleString()}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Link, Quantity and Submit */}
                        <div className="lg:col-span-5 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2">Lien Cible</label>
                            <div className={cn(
                                "flex items-center gap-4 px-5 py-5 rounded-3xl bg-slate-50 border-2 transition-all duration-300",
                                formErrors.link
                                    ? "border-red-100 bg-red-50/30"
                                    : "border-slate-50 focus-within:border-brand-primary/20 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-brand-primary/5"
                            )}>
                                <Globe size={20} className="text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={quickOrder.link}
                                    onChange={(e) => {
                                        setQuickOrder({ ...quickOrder, link: e.target.value });
                                        setFormErrors({ ...formErrors, link: null });
                                    }}
                                    className="w-full bg-transparent border-none font-bold text-slate-900 focus:ring-0 focus:outline-none p-0 text-[14px] placeholder:text-slate-300 placeholder:font-bold"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-4 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] ml-2">Quantité</label>
                            <div className={cn(
                                "flex items-center gap-4 px-5 py-5 rounded-3xl bg-slate-50 border-2 transition-all duration-300",
                                formErrors.quantity
                                    ? "border-red-100 bg-red-50/30"
                                    : "border-slate-50 focus-within:border-brand-primary/20 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-brand-primary/5"
                            )}>
                                <ShoppingCart size={20} className="text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="number"
                                    placeholder="Ex: 100"
                                    value={quickOrder.quantity}
                                    onChange={(e) => {
                                        setQuickOrder({ ...quickOrder, quantity: e.target.value });
                                        setFormErrors({ ...formErrors, quantity: null });
                                    }}
                                    className="w-full bg-transparent border-none font-black text-slate-900 focus:ring-0 focus:outline-none p-0 text-[15px] placeholder:text-slate-300 tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-3">
                            <button
                                disabled={!selectedService || !quickOrder.link || !quickOrder.quantity || placingOrder}
                                onClick={handleQuickOrder}
                                className="w-full h-[68px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-black rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:hover:shadow-xl disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:active:scale-100 overflow-hidden"
                            >
                                {placingOrder ? (
                                    <div className="h-5 w-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center">
                                            <Zap size={18} className="fill-brand-primary text-brand-primary" />
                                        </div>
                                        <span className="text-base uppercase tracking-tight">Boost</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Total & Errors */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimé :</p>
                            <p className="text-xl font-black text-slate-900">
                                {selectedService && quickOrder.quantity ? Math.ceil(selectedService.base_price_per_unit * quickOrder.quantity).toLocaleString() : '0'}
                                <span className="text-[10px] text-brand-primary ml-1 font-black">FCFA</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 w-full lg:w-auto">
                            <AnimatePresence>
                                {(formErrors.general || Object.values(formErrors).filter(Boolean)[0]) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-red-500/20"
                                    >
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span className="text-[11px] font-black uppercase tracking-wide">
                                            {formErrors.general || Object.values(formErrors).filter(Boolean)[0]}
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Activity Header */}
            <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-100">
                <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Activité Récente</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Suivi de vos commandes</p>
                </div>
                <button onClick={() => navigate('/orders')} className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-4 py-2 rounded-full uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all">
                    Tout voir
                </button>
            </div>

            {/* Activity View */}
            <RecentOrders orders={data.recentOrders} />
        </div>
    );
}
