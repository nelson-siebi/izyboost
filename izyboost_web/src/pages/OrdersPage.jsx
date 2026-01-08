import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Filter, Search, ChevronRight, Copy, CheckCircle2, Clock, XCircle, PlayCircle, Loader2 } from 'lucide-react';
import { ordersApi } from '../features/orders/ordersApi';
import { cn } from '../utils/cn';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const statuses = [
        { id: 'all', label: 'Toutes' },
        { id: 'pending', label: 'En attente' },
        { id: 'processing', label: 'En cours' },
        { id: 'completed', label: 'Terminées' },
        { id: 'cancelled', label: 'Annulées' }
    ];

    useEffect(() => {
        loadOrders();
    }, [page, statusFilter]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await ordersApi.getOrders(page, statusFilter);

            // Handle different pagination structures commonly found in Laravel
            const data = response.data || response;
            const items = Array.isArray(data) ? data : (data.data || []);

            setOrders(items);

            // Pagination info often comes in meta or directly in response
            const lastPage = response.last_page || (response.meta?.last_page) || 1;
            setTotalPages(lastPage);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            processing: 'bg-blue-50 text-blue-600 border-blue-100',
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            cancelled: 'bg-red-50 text-red-600 border-red-100',
            refunded: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        };

        const icons = {
            completed: CheckCircle2,
            processing: PlayCircle,
            pending: Clock,
            cancelled: XCircle,
            refunded: Copy,
        };

        const StatusIcon = icons[status] || Clock;
        const normalizedStatus = status?.toLowerCase() || 'pending';
        const style = styles[normalizedStatus] || 'bg-slate-50 text-slate-600 border-slate-100';

        return (
            <div className={cn("px-3 py-1 rounded-full border flex items-center gap-1.5 w-fit", style)}>
                <StatusIcon size={14} />
                <span className="text-[11px] font-black uppercase tracking-widest">{status}</span>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Commandes</h1>
                    <p className="text-slate-500 font-medium mt-1">Suivez l'état d'avancement de vos boosts en temps réel.</p>
                </div>
                {/* Stats placeholder or Search could go here */}
            </div>

            {/* Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {statuses.map(status => (
                    <button
                        key={status.id}
                        onClick={() => { setStatusFilter(status.id); setPage(1); }}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap border",
                            statusFilter === status.id
                                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-700"
                        )}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading && page === 1 ? (
                    // Loading Skeletons
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm animate-pulse space-y-4">
                            <div className="flex justify-between">
                                <div className="h-6 w-1/3 bg-slate-100 rounded-lg" />
                                <div className="h-6 w-24 bg-slate-100 rounded-full" />
                            </div>
                            <div className="h-4 w-1/2 bg-slate-100 rounded" />
                        </div>
                    ))
                ) : orders.length > 0 ? (
                    orders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                        >
                            <div className="p-6 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xl shrink-0">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-base mb-1">{order.service?.name || `Service #${order.service_id}`}</h3>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                <Clock size={12} />
                                                {new Date(order.created_at).toLocaleDateString()} à {new Date(order.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                        <StatusBadge status={order.status} />
                                        <ChevronRight size={20} className={cn("text-slate-300 transition-transform duration-300", expandedOrder === order.id ? "rotate-90" : "")} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Lien</p>
                                        <p className="text-xs font-bold text-slate-700 truncate">{order.link}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Quantité</p>
                                        <p className="text-xs font-bold text-slate-700">{order.quantity}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Prix</p>
                                        <p className="text-xs font-bold text-slate-700">{(order.sell_price || order.charge || 0).toLocaleString()} F</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Reste</p>
                                        <p className="text-xs font-bold text-slate-700">{order.remains || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Expanded Section */}
                            <AnimatePresence>
                                {expandedOrder === order.id && (
                                    <motion.div
                                        key={`order-details-${order.id}`}
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="bg-slate-50 border-t border-slate-100 overflow-hidden"
                                    >
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Détails de démarrage</p>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                                    <span className="text-sm font-bold text-slate-600">Compteur Initial</span>
                                                    <span className="text-sm font-black text-slate-900">{order.start_count || 0}</span>
                                                </div>
                                                <div className="flex justify-between items-center py-2 border-b border-slate-200/50">
                                                    <span className="text-sm font-bold text-slate-600">Compteur Actuel</span>
                                                    <span className="text-sm font-black text-slate-900">{(parseInt(order.start_count || 0) + parseInt(order.quantity) - parseInt(order.remains || 0))}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">Actions</p>
                                                <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all flex items-center justify-center gap-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(order.link);
                                                        // Could add toast here
                                                    }}
                                                >
                                                    <Copy size={14} />
                                                    Copier le lien
                                                </button>
                                                {/* Re-order button could go here */}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                        <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-4">
                            <ShoppingCart size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">Aucune commande trouvée</h3>
                        <p className="text-slate-400 font-bold text-sm">Vos boosts apparaîtront ici.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls - Simple Implementation */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        Précédent
                    </button>
                    <span className="px-4 py-2 rounded-xl bg-slate-50 text-slate-900 font-black text-sm flex items-center">
                        Page {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
