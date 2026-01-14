import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Search, Filter, ShoppingCart, Zap, Star, LayoutGrid, List,
    Instagram, Facebook, Twitter, Youtube, Music, Heart, Globe,
    ChevronDown, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { servicesApi } from '../features/services/servicesApi';
import { dashboardApi } from '../features/dashboard/dashboardApi';
import { cn } from '../utils/cn';
import PageLoader from '../components/PageLoader';
import TutorialCTA from '../components/TutorialCTA';

const SOCIAL_NETWORKS_CONFIG = {
    facebook: { icon: Facebook, color: 'from-[#1877F2] to-[#165EBE]' },
    instagram: { icon: Instagram, color: 'from-[#833AB4] via-[#FD1D1D] to-[#FCA777]' },
    tiktok: { icon: Music, color: 'from-[#000000] to-[#25F4EE]' },
    youtube: { icon: Youtube, color: 'from-[#FF0000] to-[#D20000]' },
    twitter: { icon: Twitter, color: 'from-[#1DA1F2] to-[#0C85D0]' },
    telegram: { icon: Globe, color: 'from-[#229ED9] to-[#1B7FA6]' },
    linkedin: { icon: Globe, color: 'from-[#0A66C2] to-[#004182]' },
};

export default function ServicesPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialNetwork = searchParams.get('network');
    const initialSearch = searchParams.get('search');

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [selectedNetwork, setSelectedNetwork] = useState(initialNetwork || 'all');
    const [selectedService, setSelectedService] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

    // Quick Order State
    const [link, setLink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [orderProcessing, setOrderProcessing] = useState(false);
    const [orderNotification, setOrderNotification] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (initialNetwork) {
            setSelectedNetwork(initialNetwork);
        }
        if (initialSearch) {
            setSearchQuery(initialSearch);
        }
    }, [initialNetwork, initialSearch]);

    const loadData = async () => {
        try {
            const data = await servicesApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load services', error);
        } finally {
            setLoading(false);
        }
    };

    const openOrderModal = (service) => {
        setSelectedService(service);
        setIsOrderModalOpen(true);
        // Reset form
        setLink('');
        setQuantity('');
        setOrderNotification(null);
    };

    // Slugify helper
    const slugify = (text) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    // Filter Logic
    const filteredServices = categories.flatMap(cat =>
        (cat.services || []).map(svc => ({
            ...svc,
            categoryName: cat.name,
            categorySlug: cat.slug || slugify(cat.name)
        }))
    ).filter(svc => {
        // Match by exact category slug (from Dashboard) or by platform name (from tabs)
        const matchNetwork = selectedNetwork === 'all' ||
            svc.categorySlug === selectedNetwork ||
            svc.categorySlug.startsWith(selectedNetwork + '-') ||
            svc.categoryName.toLowerCase().includes(selectedNetwork.replace(/-/g, ' '));

        const matchSearch = !searchQuery || svc.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchNetwork && matchSearch;
    });

    // Generate dynamic categories list from API data
    const dynamicNetworks = [...new Set(categories.map(cat => {
        // Extract the main network name (e.g., from "Instagram - Followers" to "instagram")
        const name = cat.name.toLowerCase();
        for (const net in SOCIAL_NETWORKS_CONFIG) {
            if (name.includes(net)) return net;
        }
        return slugify(cat.name).split('-')[0]; // Fallback to first part of slug
    }))].filter(Boolean);

    const categoriesList = ['all', ...dynamicNetworks];

    const handleOrder = async (e) => {
        e.preventDefault();
        if (!selectedService || !link || !quantity) return;

        setOrderProcessing(true);
        try {
            await dashboardApi.placeOrder({
                service_id: selectedService.id,
                link,
                quantity: parseInt(quantity)
            });
            setOrderNotification({ type: 'success', message: 'Commande placée avec succès!' });

            // Note: with no framer motion, we can safely close the modal if we want, or leave it.
            // Leaving it open as requested previously for stability.
        } catch (error) {
            setOrderNotification({
                type: 'error',
                message: error.response?.data?.message || 'Erreur lors de la commande.'
            });
        } finally {
            setOrderProcessing(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 relative">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Catalogue de Services</h1>
                <p className="text-slate-500 font-medium mt-1">Explorez nos solutions de boost pour tous vos réseaux.</p>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm sticky top-24 z-30 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 md:pb-0">
                    {categoriesList.map(net => {
                        const config = SOCIAL_NETWORKS_CONFIG[net];
                        const Icon = config?.icon || LayoutGrid;
                        return (
                            <button
                                key={net}
                                onClick={() => setSelectedNetwork(net)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                                    selectedNetwork === net
                                        ? "bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/10"
                                        : "bg-slate-50 text-slate-500 font-medium hover:bg-slate-100"
                                )}
                            >
                                <Icon size={16} />
                                <span className="capitalize text-xs font-bold">{net === 'all' ? 'Tous' : net}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher un service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-primary/20 placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Services List - Full Width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-white rounded-[24px] border border-slate-100 animate-pulse" />)
                ) : filteredServices.length > 0 ? (
                    filteredServices.map(service => (
                        <div
                            key={service.id}
                            onClick={() => openOrderModal(service)}
                            className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm cursor-pointer group transition-all hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5 hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-8 w-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-black">
                                        {service.id}
                                    </span>
                                    <span className="px-2 py-1 rounded-lg bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 truncate max-w-[120px]">
                                        {service.categoryName}
                                    </span>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-lg font-black text-slate-900">{service.rate.toLocaleString()} F</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Par 1000</p>
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-brand-primary transition-colors mb-4 line-clamp-2 min-h-[2.5em]">
                                {service.name}
                            </h3>

                            <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-50">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Min: {service.min_quantity}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Max: {service.max_quantity.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                    <ShoppingCart size={16} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold">Aucun service trouvé pour cette recherche.</p>
                    </div>
                )}
            </div>

            {/* Tutorial Section */}
            <div className="mt-12 mb-8 animate-[fade-in-up_0.5s_ease-out]">
                <TutorialCTA variant="grid" />
            </div>

            {isOrderModalOpen && selectedService && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 animate-[fade-in_0.2s_ease-out]"
                        onClick={() => !orderProcessing && setIsOrderModalOpen(false)}
                    />
                    <div
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] shadow-2xl z-50 p-6 md:p-8 animate-[zoom-in_0.3s_ease-out]"
                    >
                        <button
                            onClick={() => setIsOrderModalOpen(false)}
                            disabled={orderProcessing}
                            className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                                <Zap size={12} className="fill-brand-primary" />
                                Boost Rapide
                            </div>
                            <h2 className="text-xl font-black text-slate-900 leading-tight">
                                {selectedService.name}
                            </h2>
                        </div>

                        <form onSubmit={handleOrder} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Lien Cible</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https:// instagram.com/..."
                                    className="w-full h-12 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-2">Quantité</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={`Min: ${selectedService.min_quantity}`}
                                        className="w-full h-12 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:border-brand-primary/20 transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                                        Min: {selectedService.min_quantity}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500">Total à payer</span>
                                <span className="text-xl font-black text-slate-900">
                                    <span>{quantity ? Math.ceil((selectedService.rate / 1000) * quantity).toLocaleString() : '0'}</span> <span className="text-sm text-brand-primary">FCFA</span>
                                </span>
                            </div>

                            {orderNotification && (
                                <div className={cn(
                                    "p-3 rounded-xl flex items-center gap-2 text-xs font-bold",
                                    orderNotification.type === 'success' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                    {orderNotification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {orderNotification.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!link || !quantity || orderProcessing}
                                className="w-full py-4 rounded-xl bg-slate-900 text-white font-black shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {orderProcessing ? <div className="h-5 w-5 border-2 border-white/20 rounded-full animate-spin border-t-white" /> : (
                                    <>
                                        Confirmer la Commande <ShoppingCart size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div >
    );
}
