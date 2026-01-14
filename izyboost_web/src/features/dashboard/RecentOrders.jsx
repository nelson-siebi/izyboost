
import { Eye, Clock, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';

const StatusBadge = ({ status }) => {
    const configs = {
        pending: { color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock, label: "En attente" },
        processing: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock, label: "En cours" },
        completed: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle, label: "Terminé" },
        failed: { color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle, label: "Échoué" },
        canceled: { color: "bg-slate-50 text-slate-700 border-slate-200", icon: AlertCircle, label: "Annulé" },
    };

    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", config.color)}>
            <Icon size={12} strokeWidth={2.5} />
            {config.label}
        </span>
    );
};

export default function RecentOrders({ orders = [], limit = 5 }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const displayedOrders = orders.slice(0, limit);

    if (displayedOrders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={20} className="text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">Aucune commande récente</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Lien</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">État</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {displayedOrders.map((order, i) => (
                            <tr
                                key={order.id}
                                style={{ animationDelay: `${i * 50}ms` }}
                                className="group hover:bg-slate-50/50 transition-colors cursor-pointer animate-[fade-in-up_0.3s_ease-out_both]"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                            <ShoppingCart size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900 line-clamp-1 max-w-[200px]">
                                                {order.service?.name || `Service #${order.service_id}`}
                                            </p>
                                            <p className="text-xs text-slate-500">ID: #{order.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-[150px] truncate">
                                        <span className="text-sm text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                            {order.link}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-slate-900">
                                        {Number(order.sell_price || 0).toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">XAF</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile List - Cards */}
            <div className="md:hidden space-y-3">
                {displayedOrders.map((order, i) => (
                    <div
                        key={order.id}
                        style={{ animationDelay: `${i * 50}ms` }}
                        className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm active:scale-98 transition-transform animate-[fade-in-up_0.3s_ease-out_both]"
                        onClick={() => setSelectedOrder(order)}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                                    <ShoppingCart size={14} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                                        {order.service?.name || `Service #${order.service_id}`}
                                    </p>
                                    <p className="text-xs text-slate-500">ID: #{order.id}</p>
                                </div>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        <div className="flex justify-between items-center pl-11">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 mb-0.5">Montant</span>
                                <span className="text-sm font-bold text-slate-900">
                                    {Number(order.sell_price || 0).toLocaleString('fr-FR')} XAF
                                </span>
                            </div>
                            <button className="text-xs font-medium text-brand-primary bg-brand-primary/5 px-3 py-1.5 rounded-lg">
                                Détails
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Details Modal */}
            <div className="relative z-[200]">
                {selectedOrder && (
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
                            onClick={() => setSelectedOrder(null)}
                        />
                        <div
                            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl p-6 md:p-8 animate-[zoom-in_0.3s_ease-out]"
                        >
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <AlertCircle size={20} className="text-slate-400 rotate-45" />
                            </button>

                            <div className="mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                                    <ShoppingCart size={28} />
                                </div>
                                <h1 className="text-xl font-black text-slate-900">Détails de la Commande</h1>
                                <p className="text-sm text-slate-500">ID Transaction: #{selectedOrder.id}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service</p>
                                    <p className="text-sm font-bold text-slate-900 leading-snug">
                                        {selectedOrder.service?.name || 'Service Boost'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quantité</p>
                                        <p className="text-sm font-bold text-slate-900">{selectedOrder.quantity?.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Prix Payé</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {Number(selectedOrder.sell_price || 0).toLocaleString()} <span className="text-[10px] text-brand-primary">F</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lien Cible</p>
                                    <p className="text-xs font-bold text-slate-600 truncate">{selectedOrder.link}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Statut Actuel</p>
                                        <StatusBadge status={selectedOrder.status} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date</p>
                                        <p className="text-xs font-bold text-slate-600">
                                            {new Date(selectedOrder.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="w-full mt-8 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-brand-primary transition-all active:scale-95"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
