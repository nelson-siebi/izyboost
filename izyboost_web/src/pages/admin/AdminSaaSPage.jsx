import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import { Globe, Edit2, Check, X, ExternalLink, Loader2, Cloud, Layout, Server, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function AdminSaaSPage() {
    const [activeTab, setActiveTab] = useState('plans');
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null);
    const [editPrices, setEditPrices] = useState({ monthly: '', yearly: '' });
    const [stats, setStats] = useState({ active_platforms: 0, total_revenue: 0, top_plan: 'N/A' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [plansData, subsData] = await Promise.all([
                adminApi.getSaaSPlans(),
                adminApi.getSubscriptions()
            ]);
            setPlans(plansData || []);
            const subs = subsData || [];
            setSubscriptions(subs);

            // Calculate pseudo-stats from data
            const activeSubs = subs.filter(s => s.status === 'active');
            setStats({
                active_platforms: activeSubs.length,
                total_revenue: 0, // Need backend support for this usually, but placeholder ok
                top_plan: plansData[0]?.name || 'Standard'
            });
        } catch (error) {
            console.error('Failed to load SaaS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (planId) => {
        try {
            await adminApi.updateSaaSPlan(planId, {
                monthly_price: parseFloat(editPrices.monthly),
                yearly_price: parseFloat(editPrices.yearly)
            });
            setEditingPlan(null);
            loadData();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">SaaS & White Label</h1>
                    <p className="text-slate-500 font-medium">Gérez vos offres et instances clients</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={cn(
                            "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                            activeTab === 'plans'
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Layout className="h-4 w-4" /> Plans
                    </button>
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={cn(
                            "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                            activeTab === 'subscriptions'
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Server className="h-4 w-4" /> Plateformes
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                    <Cloud className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                    <p className="font-bold text-blue-100 uppercase text-xs tracking-wider mb-2">Plateformes Actives</p>
                    <p className="text-4xl font-black">{stats.active_platforms}</p>
                </motion.div>
                <motion.div variants={item} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full" />
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Plan Populaire</p>
                    <p className="text-2xl font-black text-slate-800">{stats.top_plan}</p>
                </motion.div>
                <motion.div variants={item} className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Revenu Mensuel Est.</p>
                    <p className="text-2xl font-black text-slate-800">{(stats.active_platforms * 15000).toLocaleString()} F</p>
                </motion.div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'plans' ? (
                    <motion.div
                        key="plans"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {plans.map((plan, i) => (
                            <div
                                key={plan.id}
                                className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600" />

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                                        <Globe className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">Offre White-Label</p>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 mb-8 leading-relaxed">{plan.description || "Plan standard pour démarrer votre propre plateforme de services."}</p>

                                {editingPlan === plan.id ? (
                                    <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Mensuel</label>
                                                <input
                                                    type="number"
                                                    value={editPrices.monthly}
                                                    onChange={(e) => setEditPrices({ ...editPrices, monthly: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Annuel</label>
                                                <input
                                                    type="number"
                                                    value={editPrices.yearly}
                                                    onChange={(e) => setEditPrices({ ...editPrices, yearly: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => handleUpdatePlan(plan.id)}
                                                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingPlan(null)}
                                                className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Mensuel</span>
                                                <span className="text-lg font-black text-slate-900">{plan.monthly_price?.toLocaleString()} F</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Annuel</span>
                                                <span className="text-lg font-black text-slate-900">{plan.yearly_price?.toLocaleString()} F</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setEditingPlan(plan.id);
                                                setEditPrices({ monthly: plan.monthly_price, yearly: plan.yearly_price });
                                            }}
                                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="h-4 w-4" /> Modifier les Tarifs
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="subscriptions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">URL</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Domaine</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Expiration</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {subscriptions.length > 0 ? subscriptions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {sub.user?.username?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span className="font-bold text-slate-900 text-sm">{sub.user?.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-500">{sub.plan?.name}</td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={sub.platform_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                                >
                                                    {new URL(sub.platform_url).hostname} <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{sub.custom_domain || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{new Date(sub.expires_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                )}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                                                    <p className="text-slate-500 font-medium text-sm">Aucune souscription active pour le moment.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
