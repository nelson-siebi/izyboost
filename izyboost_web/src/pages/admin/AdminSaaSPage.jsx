import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import { cn } from '../../utils/cn';
import { Globe, Edit2, Check, X, ExternalLink, Loader2, Cloud, Layout, Server, AlertCircle, Plus, Lock, User, Link as LinkIcon, Mail } from 'lucide-react';


export default function AdminSaaSPage() {
    const [activeTab, setActiveTab] = useState('plans');
    const [plans, setPlans] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit & Create States
    const [editingPlan, setEditingPlan] = useState(null);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [planForm, setPlanForm] = useState({
        name: '',
        monthly_price: '',
        yearly_price: '',
        lifetime_price: '',
        setup_fee: '0'
    });

    const [stats, setStats] = useState({ active_platforms: 0, total_revenue: 0, top_plan: 'N/A' });

    // Approval Modal State
    const [isApproving, setIsApproving] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const [approvalForm, setApprovalForm] = useState({
        site_url: '',
        admin_url: '/admin',
        admin_username: 'admin',
        admin_password: '',
        send_email: true
    });

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
            const subs = subsData.data || subsData || [];
            setSubscriptions(subs);

            const activeSubs = subs.filter(s => s.status === 'active');
            setStats({
                active_platforms: activeSubs.length,
                total_revenue: 0,
                top_plan: plansData[0]?.name || 'Standard'
            });
        } catch (error) {
            console.error('Failed to load SaaS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async () => {
        try {
            await adminApi.createSaaSPlan({
                name: planForm.name,
                monthly_price: parseFloat(planForm.monthly_price),
                yearly_price: parseFloat(planForm.yearly_price),
                lifetime_price: planForm.lifetime_price ? parseFloat(planForm.lifetime_price) : null,
                setup_fee: parseFloat(planForm.setup_fee || 0),
                features: [],
                limits: {}
            });
            setIsCreatingPlan(false);
            setPlanForm({ name: '', monthly_price: '', yearly_price: '', lifetime_price: '', setup_fee: '0' });
            loadData();
        } catch (error) {
            alert('Erreur lors de la création');
        }
    };

    const handleUpdatePlan = async (planId) => {
        try {
            await adminApi.updateSaaSPlan(planId, {
                monthly_price: parseFloat(planForm.monthly_price),
                yearly_price: parseFloat(planForm.yearly_price),
                lifetime_price: planForm.lifetime_price ? parseFloat(planForm.lifetime_price) : null,
                setup_fee: parseFloat(planForm.setup_fee || 0)
            });
            setEditingPlan(null);
            loadData();
        } catch (error) {
            alert('Erreur lors de la mise à jour');
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!confirm('Voulez-vous vraiment supprimer ce plan ? Cette action est irréversible.')) return;
        try {
            await adminApi.deleteSaaSPlan(planId);
            loadData();
        } catch (error) {
            alert('Erreur lors de la suppression. Ce plan est peut-être utilisé par des sites actifs.');
        }
    };

    const openApprovalModal = (site) => {
        setSelectedSite(site);
        const finalUrl = site.custom_domain
            ? `https://${site.custom_domain}`
            : `https://${site.subdomain || ''}.izyboost.com`;

        setApprovalForm({
            site_url: site.site_url || finalUrl,
            admin_url: '/admin',
            admin_username: 'admin',
            admin_password: Math.random().toString(36).slice(-10),
            send_email: true
        });
        setIsApproving(true);
    };

    const handleConfirmApproval = async () => {
        if (!selectedSite) return;
        try {
            await adminApi.approveSite(selectedSite.id, approvalForm);
            loadData();
            setIsApproving(false);
            alert("Site approuvé et identifiants envoyés.");
        } catch (error) {
            alert("Erreur lors de l'approbation.");
        }
    };

    const handleReject = async (id) => {
        if (!confirm('Rejeter cette plateforme ?')) return;
        try {
            await adminApi.rejectSite(id);
            loadData();
        } catch (error) {
            alert('Erreur lors du rejet');
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
        <div
            className="space-y-8 max-w-7xl mx-auto pb-20 animate-[fade-in_0.5s_ease-out]"
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
                        onClick={() => setActiveTab('pending')}
                        className={cn(
                            "px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2",
                            activeTab === 'pending'
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <AlertCircle className="h-4 w-4" /> En attente
                        {subscriptions.filter(s => s.status === 'pending').length > 0 && (
                            <span className="bg-white text-orange-500 px-1.5 rounded-md text-[10px] ml-1">{subscriptions.filter(s => s.status === 'pending').length}</span>
                        )}
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
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden animate-[fade-in-up_0.3s_ease-out]">
                    <Cloud className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                    <p className="font-bold text-blue-100 uppercase text-xs tracking-wider mb-2">Plateformes Actives</p>
                    <p className="text-4xl font-black">{stats.active_platforms}</p>
                </div>
                <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden animate-[fade-in-up_0.4s_ease-out]">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full" />
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Plan Populaire</p>
                    <p className="text-2xl font-black text-slate-800">{stats.top_plan}</p>
                </div>
                <div className="bg-white rounded-[24px] p-6 border border-slate-200 shadow-sm relative overflow-hidden animate-[fade-in-up_0.5s_ease-out]">
                    <p className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Revenu Mensuel Est.</p>
                    <p className="text-2xl font-black text-slate-800">{(stats.active_platforms * 15000).toLocaleString()} F</p>
                </div>
            </div>

            {/* Content Area */}
            <div>
                {activeTab === 'plans' ? (
                    <div
                        className="space-y-6 animate-[fade-in_0.3s_ease-out]"
                    >
                        <div className="flex justify-end">
                            {isCreatingPlan ? (
                                <div className="bg-white p-6 rounded-[24px] shadow-xl w-full max-w-2xl border border-slate-200 animate-[fade-in-up_0.3s_ease-out]">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-black text-lg">Créer un Nouveau Plan</h3>
                                        <button onClick={() => setIsCreatingPlan(false)}><X size={20} className="text-slate-400" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Nom du Plan</label>
                                            <input type="text" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} className="w-full h-10 px-3 border rounded-xl" placeholder="Ex: Starter" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Prix Mensuel</label>
                                            <input type="number" value={planForm.monthly_price} onChange={e => setPlanForm({ ...planForm, monthly_price: e.target.value })} className="w-full h-10 px-3 border rounded-xl" placeholder="3000" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase">Prix Annuel</label>
                                            <input type="number" value={planForm.yearly_price} onChange={e => setPlanForm({ ...planForm, yearly_price: e.target.value })} className="w-full h-10 px-3 border rounded-xl" placeholder="30000" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Prix À Vie (Lifetime) - Optionnel</label>
                                            <input type="number" value={planForm.lifetime_price} onChange={e => setPlanForm({ ...planForm, lifetime_price: e.target.value })} className="w-full h-10 px-3 border rounded-xl" placeholder="Laisser vide si indisponible" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">Frais de mise en service (Setup Fee)</label>
                                            <input type="number" value={planForm.setup_fee} onChange={e => setPlanForm({ ...planForm, setup_fee: e.target.value })} className="w-full h-10 px-3 border rounded-xl" placeholder="0" />
                                        </div>
                                    </div>
                                    <button onClick={handleCreatePlan} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Créer le Plan</button>
                                </div>
                            ) : (
                                <button onClick={() => setIsCreatingPlan(true)} className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20">
                                    <Plus className="h-5 w-5" /> Nouveau Plan
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                                    {editingPlan === plan.id ? (
                                        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Mensuel</label>
                                                    <input
                                                        type="number"
                                                        value={planForm.monthly_price}
                                                        onChange={(e) => setPlanForm({ ...planForm, monthly_price: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Annuel</label>
                                                    <input
                                                        type="number"
                                                        value={planForm.yearly_price}
                                                        onChange={(e) => setPlanForm({ ...planForm, yearly_price: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Lifetime</label>
                                                    <input
                                                        type="number"
                                                        value={planForm.lifetime_price}
                                                        onChange={(e) => setPlanForm({ ...planForm, lifetime_price: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                                        placeholder="N/A"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Setup Fee</label>
                                                    <input
                                                        type="number"
                                                        value={planForm.setup_fee}
                                                        onChange={(e) => setPlanForm({ ...planForm, setup_fee: e.target.value })}
                                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleUpdatePlan(plan.id)}
                                                    className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
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
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                                                    <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Lifetime</span>
                                                    <span className="text-lg font-black text-slate-900">{plan.lifetime_price ? plan.lifetime_price.toLocaleString() + ' F' : '-'}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors group border-t border-slate-100">
                                                    <span className="text-sm font-bold text-slate-500 group-hover:text-blue-600">Setup Fee</span>
                                                    <span className="text-md font-bold text-slate-700">{plan.setup_fee ? Number(plan.setup_fee).toLocaleString() + ' F' : 'Gratuit'}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setEditingPlan(plan.id);
                                                    setPlanForm({
                                                        monthly_price: plan.monthly_price,
                                                        yearly_price: plan.yearly_price,
                                                        lifetime_price: plan.lifetime_price || '',
                                                        setup_fee: plan.setup_fee || '0'
                                                    });
                                                }}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <Edit2 className="h-4 w-4" /> Modifier les Tarifs
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="w-full py-2 text-slate-400 hover:text-red-500 text-xs font-bold transition-colors mt-2"
                                            >
                                                Supprimer ce plan
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'subscriptions' ? (
                    <div
                        key="subscriptions"
                        className="bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-[fade-in_0.3s_ease-out]"
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
                                                {sub.site?.site_url ? (
                                                    <a
                                                        href={sub.site.site_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
                                                    >
                                                        Visiter <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{sub.site?.custom_domain || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500 font-medium">{sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'Lifetime'}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                    sub.status === 'active' && 'bg-emerald-100 text-emerald-700',
                                                    sub.status === 'lifetime' && 'bg-blue-100 text-blue-700',
                                                    sub.status === 'pending' && 'bg-orange-100 text-orange-700',
                                                    !['active', 'lifetime', 'pending'].includes(sub.status) && 'bg-red-100 text-red-700'
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
                    </div>
                ) : activeTab === 'pending' ? (
                    <div
                        key="pending"
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fade-in_0.3s_ease-out]"
                    >
                        {subscriptions.filter(s => s.status === 'pending').map((sub) => (
                            <div key={sub.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-black">
                                            {sub.user?.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{sub.user?.username}</h4>
                                            <p className="text-xs text-slate-500">{sub.plan?.name}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">En attente</span>
                                </div>
                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-400 font-medium">Nom Site</span>
                                        <span className="font-bold text-slate-700">{sub.site?.site_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-400 font-medium">Domaine</span>
                                        <span className="font-bold text-blue-600">{sub.site?.custom_domain || sub.site?.subdomain || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                                        <span className="text-slate-400 font-medium">Intervalle</span>
                                        <span className="font-bold text-slate-900 capitalize">{sub.interval || 'Mensuel'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2">
                                        <span className="text-slate-400 font-medium">Modèle</span>
                                        <span className="font-bold text-slate-900">{sub.site?.template?.name || 'Standard'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openApprovalModal(sub.site)}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        <Check className="h-4 w-4" /> Approuver
                                    </button>
                                    <button
                                        onClick={() => handleReject(sub.site?.id)}
                                        className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="h-4 w-4" /> Rejeter
                                    </button>
                                </div>
                            </div>
                        ))}
                        {subscriptions.filter(s => s.status === 'pending').length === 0 && (
                            <div className="md:col-span-2 py-12 bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-center">
                                <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-bold">Aucune demande en attente</p>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {isApproving && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 animate-[fade-in_0.2s_ease-out]"
                        onClick={() => setIsApproving(false)}
                    />
                    <div
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] shadow-2xl z-50 p-6 animate-[scale-in_0.2s_ease-out]"
                    >
                        <h3 className="text-xl font-black text-slate-900 mb-4">Valider & Livrer le Site</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2 mb-1 block">URL Finale du Site</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input
                                        value={approvalForm.site_url}
                                        onChange={e => setApprovalForm({ ...approvalForm, site_url: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-900 text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Identifiants Admin</p>

                                <div className="flex items-center gap-2">
                                    <LinkIcon size={14} className="text-slate-400" />
                                    <input
                                        value={approvalForm.admin_url}
                                        onChange={e => setApprovalForm({ ...approvalForm, admin_url: e.target.value })}
                                        className="bg-transparent text-sm font-medium text-slate-700 w-full focus:outline-none placeholder-slate-300"
                                        placeholder="/admin path"
                                    />
                                </div>
                                <div className="h-px bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-slate-400" />
                                    <input
                                        value={approvalForm.admin_username}
                                        onChange={e => setApprovalForm({ ...approvalForm, admin_username: e.target.value })}
                                        className="bg-transparent text-sm font-medium text-slate-700 w-full focus:outline-none"
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="h-px bg-slate-200" />
                                <div className="flex items-center gap-2">
                                    <Lock size={14} className="text-slate-400" />
                                    <input
                                        value={approvalForm.admin_password}
                                        onChange={e => setApprovalForm({ ...approvalForm, admin_password: e.target.value })}
                                        className="bg-transparent text-sm font-medium text-slate-700 w-full focus:outline-none"
                                        placeholder="Password"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer ${approvalForm.send_email ? 'bg-emerald-500' : 'bg-slate-200'}`} onClick={() => setApprovalForm({ ...approvalForm, send_email: !approvalForm.send_email })}>
                                    {approvalForm.send_email && <Check size={14} className="text-white" />}
                                </div>
                                <span className="text-sm font-bold text-slate-700">Envoyer l'email de bienvenue</span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsApproving(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmApproval}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                >
                                    Valider & Envoyer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
