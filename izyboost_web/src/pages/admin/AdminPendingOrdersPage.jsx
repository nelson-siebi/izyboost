import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    Clock,
    CheckCircle,
    XCircle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Search,
    ExternalLink,
    Link as LinkIcon,
    AlertCircle,
    Copy,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AdminPendingOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadPendingOrders();
    }, [page]);

    const loadPendingOrders = async () => {
        setLoading(true);
        try {
            // We fetch both pending and processing statuses
            const data = await adminApi.getOrders(page, 'pending,processing');
            setOrders(data.data || []);
            setMeta(data.meta || null);
        } catch (error) {
            console.error('Failed to load pending orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminApi.updateOrderStatus(orderId, newStatus);
            loadPendingOrders();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-50 text-amber-600 border-amber-100',
            processing: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        const labels = {
            pending: 'En attente',
            processing: 'Traitement',
        };
        const Icon = status === 'processing' ? Loader2 : Clock;

        return (
            <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 border", styles[status] || styles.pending)}>
                <Icon className={cn("w-3 h-3", status === 'processing' && "animate-spin")} />
                {labels[status] || status}
            </span>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Boosts en attente</h1>
                    <p className="text-slate-500 font-medium">Gérez et surveillez les boostages en cours de traitement</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={loadPendingOrders} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm">
                        <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Détails Boost</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Lien / URL</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Quantité</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-12 bg-slate-200 rounded-xl w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 rounded-lg w-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-900 text-sm">{order.service?.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">ID: #{order.id}</span>
                                                    <span className="text-[10px] font-black text-blue-500 uppercase">Ext: {order.external_order_id || 'N/A'}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">{order.user?.username}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 group/link max-w-xs lg:max-w-md">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                                                    <LinkIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <a
                                                        href={order.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-bold text-blue-600 hover:underline truncate block"
                                                    >
                                                        {order.link}
                                                    </a>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(order.link, order.id)}
                                                    className="p-1.5 opacity-0 group-hover/link:opacity-100 transition-opacity text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md"
                                                >
                                                    {copiedId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700">
                                                {order.quantity?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                                                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
                                                    >
                                                        Traiter
                                                    </button>
                                                )}
                                                {order.status === 'processing' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                                                    >
                                                        Terminer
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-8 w-8 text-emerald-300" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">Aucun boost en attente</h3>
                                            <p className="text-slate-500 font-medium">Toutes les commandes ont été traitées !</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
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
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 shadow-sm"
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
