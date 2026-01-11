import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    AlertTriangle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ExternalLink,
    RotateCcw,
    Package,
    Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AdminFailedOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [retrying, setRetrying] = useState(null);

    useEffect(() => {
        loadFailedOrders();
    }, [page]);

    const loadFailedOrders = async () => {
        setLoading(true);
        try {
            // Fetch orders with status 'processing' that have api_error
            const data = await adminApi.getOrders(page, 'processing');
            // Filter to only show orders with api_error
            const failedOrders = (data.data || []).filter(order => order.api_error);
            setOrders(failedOrders);
            setMeta(data.meta || null);
        } catch (error) {
            console.error('Failed to load failed orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = async (orderId) => {
        setRetrying(orderId);
        try {
            await adminApi.retryOrder(orderId);
            await loadFailedOrders();
            alert('Commande relancée avec succès !');
        } catch (error) {
            alert(error.response?.data?.error || 'Erreur lors de la relance');
        } finally {
            setRetrying(null);
        }
    };

    const getErrorBadge = (apiError) => {
        if (apiError === 'provider_low_balance') {
            return (
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 border bg-orange-50 text-orange-600 border-orange-100">
                    <AlertTriangle className="w-3 h-3" />
                    Solde Fournisseur
                </span>
            );
        }
        return (
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 border bg-red-50 text-red-600 border-red-100">
                <AlertTriangle className="w-3 h-3" />
                Erreur API
            </span>
        );
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Commandes Échouées</h1>
                    <p className="text-slate-500 font-medium">Commandes en erreur nécessitant une relance manuelle</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={loadFailedOrders}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-orange-500 hover:border-orange-200 transition-all shadow-sm"
                    >
                        <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-[24px] border border-orange-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                        <AlertTriangle className="h-7 w-7 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">{orders.length}</p>
                        <p className="text-sm font-bold text-slate-600">Commande(s) en erreur</p>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Commande</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Erreur</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-12 bg-slate-200 rounded-xl w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 rounded-lg w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-slate-900">#{order.id}</span>
                                                    {order.external_order_id && (
                                                        <span className="text-[10px] font-black text-blue-500 uppercase">Ext: {order.external_order_id}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium">{order.user?.username}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="font-bold text-slate-900 text-sm">{order.service?.name}</p>
                                                <p className="text-xs text-slate-500">Qté: {order.quantity?.toLocaleString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {getErrorBadge(order.api_error)}
                                                {order.admin_notes && (
                                                    <p className="text-[10px] text-slate-400 font-medium max-w-xs truncate">
                                                        {order.admin_notes}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRetry(order.id)}
                                                    disabled={retrying === order.id}
                                                    className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {retrying === order.id ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                            Relance...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            Relancer
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center">
                                                <Package className="h-8 w-8 text-emerald-400" />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-900">Aucune commande en erreur</h3>
                                            <p className="text-slate-500 font-medium">Toutes les commandes ont été traitées avec succès !</p>
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
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
