import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    Search,
    Filter,
    UserPlus,
    MoreVertical,
    Ban,
    DollarSign,
    Edit,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Users as UsersIcon,
    Shield,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [adjustData, setAdjustData] = useState({ amount: '', reason: '' });

    useEffect(() => {
        loadUsers();
    }, [page, search]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers(page, search);
            setUsers(data.data || []);
            setMeta(data.meta || null);
        } catch (error) {
            console.error('Failed to load users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBan = async (userId) => {
        try {
            await adminApi.toggleBan(userId);
            loadUsers();
        } catch (error) {
            alert('Erreur lors du ban');
        }
    };

    const handleAdjustBalance = async (e) => {
        e.preventDefault();
        try {
            await adminApi.adjustBalance(selectedUser.id, parseFloat(adjustData.amount), adjustData.reason);
            setShowBalanceModal(false);
            setAdjustData({ amount: '', reason: '' });
            loadUsers();
        } catch (error) {
            alert('Erreur lors de l\'ajustement');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez les {meta?.total || 0} comptes de la plateforme</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                    <UserPlus className="h-5 w-5" />
                    Nouvel Utilisateur
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email ou ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                    <Filter className="h-5 w-5" />
                    Filtres
                </button>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Solde</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 rounded-lg w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black text-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                {user.username[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{user.username}</p>
                                                <p className="text-xs text-slate-500">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5",
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                                        )}>
                                            {user.role === 'admin' && <Shield size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-black text-slate-700">{user.balance?.toLocaleString()} F</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-xs font-black uppercase inline-flex items-center gap-1.5",
                                            user.is_banned
                                                ? 'bg-red-50 text-red-600 border border-red-100'
                                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        )}>
                                            {user.is_banned ? <Ban size={10} /> : <Check size={10} />}
                                            {user.is_banned ? 'Banni' : 'Actif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowBalanceModal(true); }}
                                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-sm border border-transparent hover:border-blue-200 transition-all"
                                                title="Ajuster solde"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all border border-transparent",
                                                    user.is_banned
                                                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200'
                                                        : 'bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200'
                                                )}
                                                title={user.is_banned ? 'Débannir' : 'Bannir'}
                                            >
                                                <Ban className="h-4 w-4" />
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

            {/* Balance Adjustment Modal */}
            <AnimatePresence>
                {showBalanceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowBalanceModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white rounded-[24px] shadow-2xl p-8 w-full max-w-md overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600" />

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Ajuster le Solde</h3>
                                    <p className="text-slate-500 text-sm mt-1">Pour {selectedUser?.username}</p>
                                </div>
                                <button onClick={() => setShowBalanceModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAdjustBalance} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Montant (F)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <input
                                            type="number"
                                            value={adjustData.amount}
                                            onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
                                            placeholder="Ex: 5000"
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium pl-1">Utilisez un montant négatif (ex: -1000) pour débiter.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Raison de l'opération</label>
                                    <textarea
                                        value={adjustData.reason}
                                        onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
                                        placeholder="Ex: Remboursement commande #1234..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all"
                                >
                                    Confirmer l'Ajustement
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
