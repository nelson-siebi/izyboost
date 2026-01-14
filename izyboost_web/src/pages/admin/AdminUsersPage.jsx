import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    Search,
    Filter,
    UserPlus,
    MoreVertical,
    Ban,
    DollarSign,
    Edit2,
    Trash2,
    X,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Users as UsersIcon,
    Shield,
    Check,
    ShoppingCart,
    Globe,
    Activity,
    Mail,
    User,
    AlertCircle
} from 'lucide-react';

import { cn } from '../../utils/cn';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    // Modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form Data
    const [adjustData, setAdjustData] = useState({ amount: '', reason: '' });
    const [editData, setEditData] = useState({ username: '', email: '', role: 'user', is_active: true });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [page, search]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers(page, search);
            // Laravel pagination returns the list in 'data' and pagination info in root or 'meta'
            // But sometimes 'data' is the root if not using a resource.
            // Let's handle both.
            if (data.data && Array.isArray(data.data)) {
                setUsers(data.data);
                setMeta({
                    total: data.total,
                    current_page: data.current_page,
                    last_page: data.last_page,
                    from: data.from,
                    to: data.to
                });
            } else {
                setUsers(data || []);
            }
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
            alert('Erreur lors du changement de statut');
        }
    };

    const handleAdjustBalance = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await adminApi.adjustBalance(selectedUser.id, parseFloat(adjustData.amount), adjustData.reason);
            setShowBalanceModal(false);
            setAdjustData({ amount: '', reason: '' });
            loadUsers();
        } catch (error) {
            alert('Erreur lors de l\'ajustement');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await adminApi.updateUser(selectedUser.id, editData);
            setShowEditModal(false);
            loadUsers();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        setActionLoading(true);
        try {
            await adminApi.deleteUser(selectedUser.id);
            setShowDeleteModal(false);
            loadUsers();
        } catch (error) {
            alert('Erreur lors de la suppression');
        } finally {
            setActionLoading(false);
        }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditData({
            username: user.username,
            email: user.email,
            role: user.role,
            is_active: user.is_active
        });
        setShowEditModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Utilisateurs</h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Gérez les <span className="text-orange-600 font-bold">{meta?.total || users.length}</span> comptes de la plateforme
                    </p>
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
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Identité</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Activité</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Solde</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 rounded-lg w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded-lg w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 rounded-lg w-20 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-orange-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-black text-xs group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                                {user.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{user.username}</p>
                                                    {user.role === 'admin' && (
                                                        <Shield size={12} className="text-purple-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500">{user.email}</p>
                                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                                            <div className="flex items-center gap-1.5" title="Commandes">
                                                <ShoppingCart size={14} className="text-blue-500" />
                                                <span>{user.orders_count || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5" title="Sites Marque Blanche">
                                                <Globe size={14} className="text-emerald-500" />
                                                <span>{user.white_label_sites_count || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-900">
                                                {Number(user.balance || 0).toLocaleString('fr-FR')} F
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium font-mono">
                                                REVENUE: {Number(user.earnings || 0).toLocaleString('fr-FR')} F
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1.5 border",
                                            user.is_banned
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", user.is_banned ? 'bg-red-600' : 'bg-emerald-600')} />
                                            {user.is_banned ? 'Banni' : 'Actif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowBalanceModal(true); }}
                                                className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                                                title="Ajuster solde"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                                                title="Modifier"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleBan(user.id)}
                                                className={cn(
                                                    "p-2 rounded-lg border transition-all",
                                                    user.is_banned
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                        : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                                                )}
                                                title={user.is_banned ? 'Débannir' : 'Suspendre'}
                                            >
                                                <Ban className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                                                className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:border-red-200 transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                        <p className="text-xs text-slate-500 font-bold">
                            Affichage de {meta.from} à {meta.to} sur {meta.total} utilisateurs
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                            >
                                <ChevronLeft className="h-4 w-4" /> Précédent
                            </button>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-orange-600 hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                            >
                                Suivant <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals Container */}
            {/* Modals Container */}
            {/* Balance Adjustment Modal */}
            {showBalanceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setShowBalanceModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 animate-[scale-in_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">Ajuster le solde</h3>
                            <button onClick={() => setShowBalanceModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdjustBalance} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase">Montant (F)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input type="number" value={adjustData.amount} onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })} placeholder="Ex: 5000 ou -1000" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase">Raison</label>
                                <textarea value={adjustData.reason} onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })} placeholder="Détails de l'opération..." rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-sm resize-none" required />
                            </div>
                            <button type="submit" disabled={actionLoading} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Confirmer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 animate-[scale-in_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-black text-slate-900">Modifier l'utilisateur</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleEditUser} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase">Nom d'utilisateur</label>
                                <div className="relative">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="text" value={editData.username} onChange={(e) => setEditData({ ...editData, username: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm" required />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500 uppercase">Rôle</label>
                                    <select value={editData.role} onChange={(e) => setEditData({ ...editData, role: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none font-bold text-sm">
                                        <option value="user">Utilisateur</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-slate-500 uppercase">Statut</label>
                                    <div className="flex items-center mt-2.5 gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                        <input type="checkbox" checked={editData.is_active} onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })} className="h-4 w-4 text-orange-600 focus:ring-orange-500 rounded" />
                                        <span className="text-sm font-bold text-slate-700">Compte Actif</span>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={actionLoading} className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 mt-2">
                                {actionLoading ? <Loader2 className="animate-spin" /> : 'Enregistrer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-[scale-in_0.2s_ease-out]">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Supprimer l'utilisateur ?</h3>
                        <p className="text-slate-500 text-sm mb-8">Cette action est irréversible. Toutes les données de <strong>{selectedUser?.username}</strong> seront définitivement supprimées.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Annuler</button>
                            <button onClick={handleDeleteUser} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
