import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../features/admin/adminApi';
import {
    Search,
    Filter,
    RefreshCw,
    Package,
    Edit2,
    Check,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Tag,
    Zap,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        base_price_per_unit: '',
        user_margin_percent: '',
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, [page, categoryId]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getAdminServices(page, categoryId || null);
            setServices(data.data || []);
            setMeta(data.meta || null);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await adminApi.getAdminCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleSync = async () => {
        if (!confirm('Voulez-vous synchroniser les services depuis les fournisseurs ? Cela peut prendre quelques instants.')) return;
        setSyncing(true);
        try {
            await adminApi.syncServices();
            alert('Synchronisation lancée en arrière-plan.');
            loadData();
        } catch (error) {
            alert('Échec de la synchronisation');
        } finally {
            setSyncing(false);
        }
    };

    const startEditing = (service) => {
        setEditingId(service.id);
        setEditForm({
            base_price_per_unit: service.base_price_per_unit,
            user_margin_percent: service.user_margin_percent,
            is_active: service.is_active
        });
    };

    const handleUpdate = async (id) => {
        try {
            await adminApi.updateService(id, editForm);
            setEditingId(null);
            loadData();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const filteredServices = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toString().includes(search)
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                            Services SMM
                        </span>
                        {syncing && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 animate-pulse">
                                <Loader2 size={10} className="animate-spin text-orange-500" /> Synchro...
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Gestion des Services</h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Ajustez les prix, marges et disponibilités de vos services.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                    >
                        {syncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                        Sync Provider
                    </button>
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-200 flex items-center justify-center text-white">
                        <Package className="h-7 w-7 fill-white/20" />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm font-bold"
                    />
                </div>
                <select
                    value={categoryId}
                    onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm font-bold"
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.services_count})</option>
                    ))}
                </select>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Service</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Catégorie</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Prix de Base (1k)</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Marge (%)</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Prix Vente</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-xl w-64"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-20 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-20 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-full w-16 mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-lg w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredServices.length > 0 ? filteredServices.map((service) => (
                                <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-6 max-w-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-xs">
                                                {service.id}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate" title={service.name}>{service.name}</p>
                                                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Min: {service.min_quantity} | Max: {service.max_quantity}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                                            <Tag size={10} />
                                            {service.category?.name || 'Sans Catégorie'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        {editingId === service.id ? (
                                            <input
                                                type="number"
                                                value={editForm.base_price_per_unit}
                                                onChange={e => setEditForm({ ...editForm, base_price_per_unit: e.target.value })}
                                                className="w-20 px-2 py-1 bg-white border border-orange-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-slate-700">{service.base_price_per_unit?.toLocaleString()} F</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        {editingId === service.id ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="number"
                                                    value={editForm.user_margin_percent}
                                                    onChange={e => setEditForm({ ...editForm, user_margin_percent: e.target.value })}
                                                    className="w-16 px-2 py-1 bg-white border border-orange-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                />
                                                <span className="text-[10px] font-bold text-slate-400">%</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-bold text-slate-500">{service.user_margin_percent}%</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-orange-600">{(service.base_price_per_unit * (1 + service.user_margin_percent / 100)).toLocaleString()} F</span>
                                            {service.user_margin_percent > 0 && (
                                                <span className="text-[10px] font-bold text-emerald-500">+{((service.base_price_per_unit * service.user_margin_percent) / 100).toLocaleString()} profit</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        {editingId === service.id ? (
                                            <button
                                                onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                                                className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all",
                                                    editForm.is_active ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                                )}
                                            >
                                                {editForm.is_active ? 'Actif' : 'Inactif'}
                                            </button>
                                        ) : (
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                service.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {service.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {editingId === service.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdate(service.id)}
                                                        className="h-8 w-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(service)}
                                                    className="h-9 w-9 rounded-xl border border-slate-200 text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="h-12 w-12 text-slate-200" />
                                            <p className="text-slate-500 font-bold">Aucun service trouvé.</p>
                                            <button onClick={handleSync} className="text-sm font-black text-orange-600 hover:underline">
                                                Lancer la synchronisation ?
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-400">Page {page} sur {meta.last_page} | {meta.total} services</p>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="h-10 w-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-1 px-3 py-1 font-black text-sm text-slate-700">
                                {page}
                            </div>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="h-10 w-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-orange-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Price Adjustment Assistant (Tip Card) */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-black">Ajustement de Masse</h3>
                        </div>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Vous pouvez ajuster la marge globale de profit dans les <Link to="/admin/settings" className="text-orange-400 hover:underline font-bold">Paramètres Système</Link>.
                            Les marges individuelles définies ci-dessus ont la priorité sur la marge globale.
                        </p>
                    </div>
                    <Link
                        to="/admin/settings"
                        className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl"
                    >
                        Accéder aux Paramètres
                    </Link>
                </div>
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 blur-[100px] opacity-10 -mr-20 -mt-20 pointer-events-none" />
            </div>
        </div>
    );
}
