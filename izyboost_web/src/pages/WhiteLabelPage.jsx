import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Palette, Layers, Plus, ExternalLink, Activity, Check, X, Shield, Zap, AlertCircle, ArrowRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { whiteLabelApi } from '../features/common/extraApi';
import { cn } from '../utils/cn';

export default function WhiteLabelPage() {
    const [sites, setSites] = useState([]);
    const [plans, setPlans] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Purchase Modal State
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        plan_id: '',
        template_id: '',
        site_name: '',
        subdomain: '',
        interval: 'monthly', // monthly, yearly, lifetime
        custom_domain: false,
        domain_name: '',
        deployment_type: 'hosted_by_us',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sitesData, plansData, templatesData] = await Promise.all([
                whiteLabelApi.getSites(),
                whiteLabelApi.getPlans(),
                whiteLabelApi.getTemplates()
            ]);

            const fetchedSites = sitesData.data || (Array.isArray(sitesData) ? sitesData : []);
            const fetchedPlans = plansData.data || (Array.isArray(plansData) ? plansData : []);
            const fetchedTemplates = templatesData.data || (Array.isArray(templatesData) ? templatesData : []);

            setSites(fetchedSites);
            setPlans(fetchedPlans);
            setTemplates(fetchedTemplates);

            // Pre-select first template and plan if available and not set
            if (!formData.plan_id && fetchedPlans.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    template_id: fetchedTemplates.length > 0 ? fetchedTemplates[0].id : '',
                    plan_id: fetchedPlans[0].id
                }));
            }

        } catch (error) {
            console.error("Erreur chargement WhiteLabel:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        setError(null);
        setSuccess(false);
        setProcessing(true);
        console.log("Tentative d'achat:", formData);

        try {
            const response = await whiteLabelApi.purchase(formData);
            console.log("Achat réussi:", response);
            setSuccess(true);

            // Refresh sites list in background
            loadData();

            setTimeout(() => {
                setIsCreating(false);
                setSuccess(false);
                setStep(1);
                // Reset form optionally or keep some defaults
                setFormData(prev => ({
                    ...prev,
                    site_name: '',
                    subdomain: '',
                    custom_domain: false,
                    domain_name: ''
                }));
            }, 3000);
        } catch (err) {
            console.error("Erreur achat (Détails):", err.response?.data);
            const data = err.response?.data;

            if (data?.errors) {
                // Get all error messages
                const messages = Object.values(data.errors).flat();
                setError(messages[0] || "Erreur de validation.");
            } else if (data?.message) {
                setError(data.message);
            } else {
                setError("Une erreur inattendue est survenue lors de la validation.");
            }
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        const plan = plans.find(p => String(p.id) === String(formData.plan_id));
        if (!plan) return 0;

        let total = 0;
        if (formData.interval === 'monthly') total = Number(plan.monthly_price);
        else if (formData.interval === 'yearly') total = Number(plan.yearly_price);
        else if (formData.interval === 'lifetime') total = Number(plan.lifetime_price);

        if (Number(plan.setup_fee) > 0) total += Number(plan.setup_fee);
        return total;
    };

    const currentPlan = plans.find(p => String(p.id) === String(formData.plan_id));

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
            {/* Premium Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-brand-primary rounded-2xl text-white shadow-lg shadow-brand-primary/20">
                            <Layers size={28} />
                        </div>
                        Marque Blanche <span className="text-brand-primary">SaaS</span>
                    </h1>
                    <p className="text-slate-500 font-semibold text-lg max-w-xl">
                        Propulsez votre propre agence SMM avec notre technologie de pointe.
                    </p>
                </div>
                {sites.length > 0 && (
                    <button
                        onClick={() => {
                            setIsCreating(true);
                            setStep(1);
                            setError(null);
                            setSuccess(false);
                        }}
                        className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        Lancer un Nouveau Site
                    </button>
                )}
            </header>

            {/* Main Content Area */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-72 bg-white rounded-[40px] border border-slate-100 animate-pulse" />)}
                </div>
            ) : sites && sites.length > 0 ? (
                <div className="space-y-10">
                    {/* Management Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sites.map(site => (
                            <motion.div
                                key={site.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-brand-primary/5 transition-colors duration-500" />

                                <div className="flex items-start justify-between mb-8 relative">
                                    <div className="h-16 w-16 rounded-[24px] bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-500">
                                        <Globe size={32} />
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                        site.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {site.status === 'pending' ? 'Configuration' :
                                            site.status === 'active' ? 'Opérationnel' :
                                                site.status === 'suspended' ? 'Suspendu' : site.status}
                                    </div>
                                </div>

                                <div className="relative space-y-4">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-brand-primary transition-colors">{site.site_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-slate-400 font-bold text-sm truncate">
                                                {site.custom_domain || (site.subdomain ? `${site.subdomain}.izyboost.com` : 'Configuration DNS...')}
                                            </p>
                                            <ExternalLink size={12} className="text-slate-300" />
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full" />

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all duration-300">
                                            <Palette size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Design</span>
                                        </button>
                                        <button className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all duration-300">
                                            <Activity size={20} />
                                            <span className="text-[10px] font-black uppercase tracking-wider">Ventes</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Premium Landing / Empty State */
                <div className="space-y-12 pt-4">
                    <div className="bg-white rounded-[60px] border border-slate-100 p-8 lg:p-20 relative overflow-hidden shadow-2xl shadow-slate-200/50">
                        {/* Abstract Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-50" />

                        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 rounded-full text-brand-primary text-xs font-black uppercase tracking-widest">
                                    <Zap size={14} className="fill-brand-primary" />
                                    Solution Clé en Main
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.1]">
                                    Votre futur business <br /> starts <span className="text-brand-primary">ici.</span>
                                </h2>
                                <p className="text-lg text-slate-500 font-bold leading-relaxed max-w-lg">
                                    Plus besoin de compétences techniques. Nous vous offrons une plateforme complète, hébergée et synchronisée avec nos services. Fixez vos marges, nous gérons le reste.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-slate-900/30 hover:-translate-y-1 hover:bg-brand-primary transition-all flex items-center gap-3"
                                    >
                                        Démarrer mon agence
                                        <ArrowUpRight size={20} />
                                    </button>
                                    <div className="flex -space-x-4 items-center pl-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                                        ))}
                                        <span className="ml-6 text-sm font-bold text-slate-400">+150 agences en ligne</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { icon: Palette, title: "Custom Branding", desc: "Logo, couleurs & domaine perso." },
                                    { icon: Server, title: "Hébergement SSL", desc: "Sécurisé, rapide et gratuit." },
                                    { icon: Activity, title: "Auto-Sync API", desc: "Commandes reliées en temps réel." },
                                    { icon: Shield, title: "Support Dédié", desc: "On s'occupe de la maintenance." }
                                ].map((feat, i) => (
                                    <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-white hover:border-brand-primary/20 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 mb-4 shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-all">
                                            <feat.icon size={24} />
                                        </div>
                                        <h4 className="font-black text-slate-900 mb-1">{feat.title}</h4>
                                        <p className="text-xs text-slate-400 font-bold">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Creation Modal */}
            <AnimatePresence mode="wait">
                {isCreating && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => !processing && !success && setIsCreating(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 40 }}
                            className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Close Button */}
                            {!success && (
                                <button
                                    onClick={() => setIsCreating(false)}
                                    disabled={processing}
                                    className="absolute top-8 right-8 p-3 bg-slate-50 rounded-full hover:bg-slate-100 hover:rotate-90 transition-all z-10"
                                >
                                    <X size={20} className="text-slate-500" />
                                </button>
                            )}

                            {/* Header Progress */}
                            <div className="p-10 pb-0 shrink-0">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-12 w-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                                        {success ? <Check size={24} strokeWidth={3} /> : <Zap size={24} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 leading-none">
                                            {success ? "C'est Parti !" : "Configuration SaaS"}
                                        </h2>
                                        <p className="text-slate-400 text-sm font-black uppercase tracking-widest mt-1">
                                            {success ? "Bienvenue Propriétaire" : `Étape ${step} sur 4`}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full mt-6 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-brand-primary shadow-[0_0_10px_rgba(var(--brand-primary-rgb),0.5)]"
                                        animate={{ width: success ? '100%' : `${(step / 4) * 100}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    />
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="p-10 overflow-y-auto custom-scrollbar">
                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.div
                                            key="success-view"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-10 text-center space-y-8"
                                        >
                                            <div className="relative inline-block">
                                                <div className="h-32 w-32 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/30 relative z-10">
                                                    <Check size={64} strokeWidth={4} />
                                                </div>
                                                <motion.div
                                                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="absolute inset-0 bg-emerald-500 rounded-[40px] blur-2xl -z-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-slate-900 leading-tight">Commande Validée !</h3>
                                                <p className="text-slate-500 font-bold max-w-xs mx-auto text-lg leading-relaxed">
                                                    Votre nouvelle agence est en cours de déploiement. Un administrateur l'activera sous peu.
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={`step-${step}`}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            className="space-y-8"
                                        >
                                            {/* Error Message */}
                                            {error && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 flex items-start gap-4 shadow-sm"
                                                >
                                                    <AlertCircle size={22} className="shrink-0 mt-0.5" />
                                                    <span className="text-sm font-black leading-snug">{error}</span>
                                                </motion.div>
                                            )}

                                            {/* Step 1: Plan Selection */}
                                            {step === 1 && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {plans.map(plan => (
                                                            <div
                                                                key={plan.id}
                                                                onClick={() => setFormData({ ...formData, plan_id: plan.id, interval: 'monthly' })}
                                                                className={cn(
                                                                    "p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                                                                    String(formData.plan_id) === String(plan.id)
                                                                        ? "border-brand-primary bg-brand-primary/[0.04] shadow-lg shadow-brand-primary/5"
                                                                        : "border-slate-100 hover:border-slate-300 bg-white"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={cn(
                                                                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                                        String(formData.plan_id) === String(plan.id) ? "bg-brand-primary border-brand-primary" : "border-slate-200"
                                                                    )}>
                                                                        {String(formData.plan_id) === String(plan.id) && <Check size={14} className="text-white" strokeWidth={4} />}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{plan.name}</h3>
                                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                                            + {Number(plan.setup_fee).toLocaleString()} F frais d'init
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-2xl font-black text-brand-primary">
                                                                        {Number(plan.monthly_price).toLocaleString()} F
                                                                    </span>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">/ mois</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Design Selection */}
                                            {step === 2 && (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        {templates.map(tpl => (
                                                            <div
                                                                key={tpl.id}
                                                                onClick={() => setFormData({ ...formData, template_id: tpl.id })}
                                                                className={cn(
                                                                    "p-6 rounded-[32px] border-2 cursor-pointer transition-all text-center group relative overflow-hidden",
                                                                    String(formData.template_id) === String(tpl.id)
                                                                        ? "border-brand-primary bg-brand-primary/[0.04]"
                                                                        : "border-slate-100 hover:border-slate-200"
                                                                )}
                                                            >
                                                                <div className="aspect-square bg-slate-50 rounded-3xl mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 overflow-hidden relative">
                                                                    <Palette size={40} className="text-slate-200" />
                                                                    {String(formData.template_id) === String(tpl.id) && (
                                                                        <div className="absolute inset-0 bg-brand-primary/10 flex items-center justify-center">
                                                                            <CheckCircle2 size={40} className="text-brand-primary" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <p className="font-black text-slate-900">{tpl.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Design Standard Pro</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Identity */}
                                            {step === 3 && (
                                                <div className="space-y-8">
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4">Nom de la Plateforme</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={formData.site_name}
                                                            onChange={e => setFormData({ ...formData, site_name: e.target.value })}
                                                            placeholder="Ex: Mon Agence SMM"
                                                            className="w-full h-16 px-8 rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-primary/30 outline-none font-bold text-lg text-slate-900 shadow-inner transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4">Adresse Internet (Sous-domaine)</label>
                                                        <div className="relative group">
                                                            <input
                                                                type="text"
                                                                required
                                                                value={formData.subdomain}
                                                                onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                                placeholder="votre-nom"
                                                                className="w-full h-16 pl-8 pr-[140px] rounded-[24px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand-primary/30 outline-none font-black text-lg text-slate-900 shadow-inner transition-all"
                                                            />
                                                            <div className="absolute right-2 top-2 bottom-2 px-6 flex items-center bg-white rounded-[18px] text-slate-400 font-black text-sm border border-slate-100 group-focus-within:border-brand-primary/20 group-focus-within:text-brand-primary transition-all">
                                                                .izyboost.com
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-400 px-4 uppercase tracking-wider leading-relaxed">
                                                            Vous pourrez configurer votre propre domaine (.com, .net) plus tard dans le panneau de gestion.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 4: Billing Recap */}
                                            {step === 4 && (
                                                <div className="space-y-10">
                                                    <div className="space-y-4">
                                                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-4">Plan de Facturation</label>
                                                        <div className="flex gap-2 p-2 bg-slate-100 rounded-[28px]">
                                                            {['monthly', 'yearly', 'lifetime'].filter(int => {
                                                                if (!currentPlan) return false;
                                                                if (int === 'monthly') return true;
                                                                if (int === 'yearly') return !!currentPlan.yearly_price;
                                                                if (int === 'lifetime') return !!currentPlan.lifetime_price;
                                                                return false;
                                                            }).map(interval => (
                                                                <button
                                                                    key={interval}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, interval })}
                                                                    className={cn(
                                                                        "flex-1 py-4 px-4 rounded-[22px] text-sm font-black transition-all whitespace-nowrap",
                                                                        formData.interval === interval ? "bg-white text-slate-900 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-900"
                                                                    )}
                                                                >
                                                                    {interval === 'monthly' ? 'Mensuel' : interval === 'yearly' ? 'Annuel (-20%)' : 'Accès à Vie'}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                                                        <div className="space-y-4 relative z-10">
                                                            <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                                                <span>Détails Transaction</span>
                                                                <span>Résumé Final</span>
                                                            </div>
                                                            <div className="h-px bg-white/10" />
                                                            <div className="flex justify-between text-lg font-black">
                                                                <span>{currentPlan?.name} SaaS</span>
                                                                <span className="text-brand-primary">
                                                                    {(formData.interval === 'monthly' ? Number(currentPlan?.monthly_price) :
                                                                        formData.interval === 'yearly' ? Number(currentPlan?.yearly_price) :
                                                                            Number(currentPlan?.lifetime_price)).toLocaleString()} F
                                                                </span>
                                                            </div>
                                                            {Number(currentPlan?.setup_fee) > 0 && (
                                                                <div className="flex justify-between text-sm font-bold text-slate-400">
                                                                    <span>Frais Technique Initial</span>
                                                                    <span>{Number(currentPlan.setup_fee).toLocaleString()} F</span>
                                                                </div>
                                                            )}
                                                            <div className="h-px bg-white/10" />
                                                            <div className="flex justify-between items-end pt-2">
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Agence</span>
                                                                <div className="text-right">
                                                                    <span className="text-4xl font-black text-white">{calculateTotal().toLocaleString()} <span className="text-brand-primary text-xl">F</span></span>
                                                                    <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">Paiement via Solde Compte</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Navigation Controls */}
                                            <div className="flex gap-4 pt-4">
                                                {step > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setStep(step - 1)}
                                                        disabled={processing}
                                                        className="h-16 px-10 bg-slate-100 text-slate-600 rounded-[24px] font-black hover:bg-slate-200 transition-all"
                                                    >
                                                        Précédent
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => step < 4 ? setStep(step + 1) : handlePurchase()}
                                                    disabled={
                                                        processing ||
                                                        (step === 1 && !formData.plan_id) ||
                                                        (step === 2 && !formData.template_id) ||
                                                        (step === 3 && (!formData.site_name || !formData.subdomain))
                                                    }
                                                    className="flex-1 h-16 bg-slate-900 text-white rounded-[24px] font-black shadow-xl shadow-slate-900/10 hover:bg-brand-primary hover:shadow-brand-primary/20 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                                                >
                                                    {processing ? (
                                                        <div className="h-6 w-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            {step === 4 ? "Lancer mon Agence" : "Suivant"}
                                                            <ArrowRight size={20} />
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
