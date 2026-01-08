import { motion } from 'framer-motion';
import { Eye, ExternalLink, Clock, CheckCircle, AlertCircle, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

const StatusBadge = ({ status }) => {
    const configs = {
        pending: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock, label: "En attente" },
        processing: { color: "bg-blue-50 text-blue-600 border-blue-100", icon: ExternalLink, label: "En cours" },
        completed: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle, label: "Terminé" },
        failed: { color: "bg-red-50 text-red-600 border-red-100", icon: AlertCircle, label: "Échoué" },
    };

    const config = configs[status] || configs.pending;

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center w-fit ${config.color}`}>
            <config.icon size={12} className="mr-1.5" />
            {config.label}
        </span>
    );
};

export default function RecentOrders({ orders = [] }) {
    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div className="bg-white lg:rounded-[40px] rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h4 className="text-xl font-black text-slate-900">Activité Récente</h4>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Vos 5 dernières transactions</p>
                </div>
                <button className="text-sm font-black text-brand-primary hover:underline hover:underline-offset-8 transition-all">Tout voir</button>
            </div>

            {/* Desktop Table - Refined alignment */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="w-[30%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">Service Détails</th>
                            <th className="w-[35%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">Cible / Lien</th>
                            <th className="w-[15%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">Montant</th>
                            <th className="w-[12%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans">État</th>
                            <th className="w-[8%] px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.length > 0 ? orders.slice(0, 5).map((order) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group hover:bg-slate-50/80 transition-all duration-300"
                            >
                                <td className="px-8 py-6">
                                    <p className="font-black text-slate-900 text-sm leading-tight group-hover:text-brand-primary transition-colors truncate">
                                        {order.service?.name || "Service ID: " + order.service_id}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase">ID COMMANDE: #{order.id}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="max-w-full">
                                        <p className="text-sm font-bold text-slate-500 break-all bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block">
                                            {order.link}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-slate-900 text-[15px]">
                                            {order.sell_price && order.sell_price !== '0.00' ? order.sell_price : '---'}
                                        </span>
                                        <span className="text-[9px] font-black text-brand-primary uppercase tracking-tighter">FCFA</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-3 bg-white hover:bg-brand-primary/10 rounded-2xl border border-slate-100 hover:border-brand-primary/20 transition-all text-slate-400 hover:text-brand-primary shadow-sm hover:shadow-md active:scale-90"
                                    >
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center">
                                        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <ShoppingCart size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucune commande trouvée</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-slate-50">
                {orders.length > 0 ? orders.slice(0, 5).map((order) => (
                    <motion.div
                        key={order.id}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 flex flex-col space-y-4 active:bg-slate-50 transition-colors"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="font-black text-slate-900 text-[15px] leading-tight truncate">
                                    {order.service?.name || "Service #" + order.service_id}
                                </p>
                                <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">Order #{order.id}</p>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-3 border border-slate-100">
                            <div className="flex-1 min-w-0 pr-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cible</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{order.link}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix</p>
                                <p className="text-sm font-black text-slate-900">{order.sell_price || order.charge || '---'} <span className="text-[9px]">FCFA</span></p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedOrder(order)}
                            className="w-full flex items-center justify-center space-x-2 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 text-sm active:bg-slate-100 transition-all"
                        >
                            <Eye size={16} />
                            <span>Voir les détails</span>
                        </button>
                    </motion.div>
                )) : (
                    <div className="p-12 text-center text-slate-400 font-bold italic">
                        Vide pour le moment.
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
                    >
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Détails de la commande</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID #{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Service</label>
                                <p className="text-sm font-bold text-slate-900">{selectedOrder.service?.name || `Service #${selectedOrder.service_id}`}</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lien Cible</label>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                                    <p className="text-xs font-mono text-brand-primary truncate">{selectedOrder.link}</p>
                                    <ExternalLink size={14} className="text-slate-400 shrink-0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantité</p>
                                    <p className="text-xl font-black text-slate-900">{selectedOrder.quantity}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reste</p>
                                    <p className="text-xl font-black text-slate-900">{selectedOrder.remains || '-'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Départ</p>
                                    <p className="text-xl font-black text-slate-900">{selectedOrder.start_count || 0}</p>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Coût</p>
                                    <p className="text-xl font-black text-emerald-700">{selectedOrder.sell_price || '0'} F</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                <StatusBadge status={selectedOrder.status} />
                                <span className="text-xs font-bold text-slate-400">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
