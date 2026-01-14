import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    DollarSign,
    CreditCard,
    TrendingUp,
    Loader2,
    Edit2,
    Check,
    X,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    CreditCard as CardIcon
} from 'lucide-react';

import { cn } from '../../utils/cn';



export default function AdminFinancePage() {
    const [stats, setStats] = useState(null);
    const [methods, setMethods] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMethod, setEditingMethod] = useState(null);
    const [editFee, setEditFee] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, methodsData, transactionsData] = await Promise.all([
                adminApi.getFinanceStats(),
                adminApi.getPaymentMethods(),
                adminApi.getTransactions(1)
            ]);
            setStats(statsData || { total_volume: 0, total_fees: 0, pending_count: 0 });
            setMethods(methodsData || []);
            setTransactions(transactionsData.data || []);
        } catch (error) {
            console.error('Failed to load finance data:', error);
            setStats({ total_volume: 0, total_fees: 0, pending_count: 0 });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFee = async (methodId) => {
        try {
            await adminApi.updatePaymentMethod(methodId, { fee_percentage: parseFloat(editFee) });
            setEditingMethod(null);
            loadData();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleVerify = async (txId) => {
        if (!confirm('Approuver ce dépôt et créditer le client ?')) return;
        try {
            setLoading(true);
            await adminApi.verifyTransaction(txId);
            loadData();
        } catch (error) {
            alert('Erreur lors de la validation');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (txId) => {
        const reason = prompt('Raison du rejet (optionnel) :');
        if (reason === null) return;
        try {
            setLoading(true);
            await adminApi.rejectTransaction(txId, { reason });
            await loadData();
        } catch (error) {
            alert('Erreur lors du rejet');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div
            className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all animate-[fade-in-up_0.3s_ease-out]"
        >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110", color)} />

            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white transition-colors", `group-hover:${color.replace('bg-', 'bg-')}`)}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        <ArrowUpRight className="h-3 w-3" />
                        {trend}
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 text-sm font-bold mb-1">{title}</h3>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div
            className="space-y-8 max-w-7xl mx-auto animate-[fade-in_0.5s_ease-out]"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance</h1>
                    <p className="text-slate-500 font-medium">Vue d'ensemble des flux financiers</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                    <Wallet className="h-5 w-5" />
                    Faire un virement
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Volume Total"
                    value={`${(stats?.total_volume || 0).toLocaleString()} F`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    trend="+12%"
                />
                <StatCard
                    title="Frais Collectés"
                    value={`${(stats?.total_fees || 0).toLocaleString()} F`}
                    icon={TrendingUp}
                    color="bg-blue-500"
                    trend="+5%"
                />
                <StatCard
                    title="En Attente"
                    value={stats?.pending_count || 0}
                    icon={Activity}
                    color="bg-amber-500"
                />
            </div>

            {/* Main Grid: Payment Methods & Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Payment Methods */}
                <div className="lg:col-span-1 bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden animate-[fade-in-up_0.5s_ease-out]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-900">Méthodes</h3>
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Configurer</button>
                    </div>
                    <div className="p-4 space-y-3">
                        {methods.map((method) => (
                            <div key={method.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xs">
                                            {method.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{method.name}</p>
                                            <p className={cn("text-[10px] font-bold uppercase", method.is_active ? "text-emerald-500" : "text-red-500")}>
                                                {method.is_active ? 'Actif' : 'Inactif'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2 px-3">
                                    <span className="text-xs text-slate-500 font-medium">Frais</span>
                                    {editingMethod === method.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editFee}
                                                onChange={(e) => setEditFee(e.target.value)}
                                                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
                                                placeholder="%"
                                            />
                                            <button onClick={() => handleUpdateFee(method.id)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"><Check className="h-3 w-3" /></button>
                                            <button onClick={() => setEditingMethod(null)} className="p-1 text-red-500 hover:bg-red-50 rounded"><X className="h-3 w-3" /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-800">{method.fee_percentage}%</span>
                                            <button
                                                onClick={() => { setEditingMethod(method.id); setEditFee(method.fee_percentage); }}
                                                className="h-6 w-6 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden animate-[fade-in-up_0.6s_ease-out]">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-lg font-black text-slate-900">Transactions Récentes</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Utilisateur</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.length > 0 ? transactions.slice(0, 8).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono text-slate-400">#{tx.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {tx.user?.username?.[0]?.toUpperCase()}
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{tx.user?.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-500 uppercase text-xs tracking-wider">{tx.type}</td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">{tx.amount?.toLocaleString()} F</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                    tx.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                            )}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-medium">{new Date(tx.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {tx.status === 'pending' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleVerify(tx.id)}
                                                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                                        title="Approuver le dépôt"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(tx.id)}
                                                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        title="Rejeter le dépôt"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                                            Aucune transaction récente
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
