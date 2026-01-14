import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    Package,
    Filter,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    ShoppingBag,
    ArrowUpRight,
    ExternalLink
} from 'lucide-react';

import { cn } from '../../utils/cn';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const tabs = [
        { id: 'all', label: 'Toutes', icon: ShoppingBag },
        { id: 'pending', label: 'En attente', icon: Clock },
        { id: 'processing', label: 'En cours', icon: Loader2 },
        { id: 'completed', label: 'Terminées', icon: CheckCircle },
        { id: 'cancelled', label: 'Annulées', icon: XCircle },
    ];

    useEffect(() => {
        loadOrders();
    }, [page, activeTab]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            // Pass null instead of empty string for 'all' to get all orders
            const status = activeTab === 'all' ? null : activeTab;
            const data = await adminApi.getOrders(page, status);
            setOrders(data.data || []);
            setMeta(data.meta || null);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            loadOrders();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleRefund = async (orderId) => {
        if (!confirm('Confirmer le remboursement ?')) return;
        try {
            await adminApi.refundOrder(orderId);
            loadOrders();
        } catch (error) {
            alert('Erreur lors du remboursement');
        }
    };

    const handleRetry = async (orderId) => {
        try {
            setLoading(true);
            await adminApi.retryOrder(orderId);
            loadOrders();
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de la relance');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            processing: 'bg-blue-50 text-blue-600 border-blue-100',
            completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            cancelled: 'bg-red-50 text-red-600 border-red-100',
        };
        const labels = {
            pending: 'En attente',
            processing: 'Traitement',
            completed: 'Terminé',
            cancelled: 'Annulé',
        };
        const icons = {
            pending: Clock,
            processing: Loader2,
            completed: CheckCircle,
            cancelled: XCircle,
        }
        const Icon = icons[status] || Clock;

        return (
            <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5 border", styles[status] || styles.pending)}>
                <Icon className="w-3 h-3" />
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Commandes</h1>
                    <p className="text-slate-500 font-medium">Suivez et gérez les {meta?.total || 0} transactions</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadOrders} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm">
                        <RefreshCw className="h-5 w-5" />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all">
                        <Filter className="h-4 w-4" />
                        Filtres
                    </button>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setPage(1); }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                                activeTab === tab.id
                                    ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-orange-500" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Commande</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 rounded-full w-10"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.map((order) => (
                                <tr key={order.id} className="hover:bg-orange-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                                                <Package className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">#{order.id}</p>
                                                <p className="text-xs text-slate-400 font-medium">{order.item_count || 1} article(s)</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                                {order.user?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{order.user?.username || 'Utilisateur inconnu'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{order.service?.name || 'Service standard'}</td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-900">{order.total_price?.toLocaleString()} F</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {getStatusBadge(order.status)}
                                            {order.api_error && (
                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">
                                                    Erreur API : {order.api_error === 'provider_low_balance' ? 'Solde Fournisseur' : 'Échec Provider'}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {order.status === 'processing' && order.api_error && (
                                                <button
                                                    onClick={() => handleRetry(order.id)}
                                                    className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                                    title="Relancer le Boostage"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                            )}
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Passer en traitement"
                                                >
                                                    <Loader2 className="h-4 w-4" />
                                                </button>
                                            )}
                                            {order.status === 'processing' && !order.api_error && (
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                    title="Terminer"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                            {order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => handleRefund(order.id)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Rembourser"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                                <ExternalLink className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                        <p className="text-sm text-slate-500 font-medium">Page {page} sur {meta.last_page}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
