import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Palette, Layers, Plus, ExternalLink, Activity, Check, X, Shield, Zap, AlertCircle } from 'lucide-react';
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

    // Form Data
    const [formData, setFormData] = useState({
        template_id: '',
        site_name: '',
        subdomain: '',
        interval: 'monthly', // monthly, yearly
        custom_domain: false,
        domain_name: '',
        deployment_type: 'hosted_by_us',
    });

    // Hardcoded pricing from backend controller
    const PRICING = {
        monthly: 3000,
        yearly: 15000, // 5 months free equivalent
        customDomainFee: 8000
    };

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
            setSites(sitesData.data || sitesData);
            setPlans(plansData.data || plansData);
            setTemplates(templatesData.data || templatesData);

            // Pre-select first template if available
            if ((templatesData.data || templatesData).length > 0) {
                setFormData(prev => ({ ...prev, template_id: (templatesData.data || templatesData)[0].id }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        setError(null);
        setProcessing(true);
        try {
            await whiteLabelApi.purchase(formData);
            setIsCreating(false);
            setStep(1);
            setFormData({
                template_id: templates[0]?.id || '',
                site_name: '',
                subdomain: '',
                interval: 'monthly',
                custom_domain: false,
                domain_name: '',
                deployment_type: 'hosted_by_us',
            });
            await loadData(); // Refresh list
            alert('Félicitations ! Votre site est en cours de création. 🚀');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors?.balance?.[0] || 'Une erreur est survenue.';
            setError(msg);
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        let total = formData.interval === 'yearly' ? PRICING.yearly : PRICING.monthly;
        if (formData.custom_domain) total += PRICING.customDomainFee;
        return total;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20 relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marque Blanche (SaaS)</h1>
                    <p className="text-slate-500 font-medium mt-1">Créez votre propre agence SMM et revendez nos services.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <Plus size={20} />
                    Créer un Site
                </button>
            </header>

            {/* Sites Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-slate-100 rounded-[32px] animate-pulse" />)}
                </div>
            ) : sites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map(site => (
                        <div key={site.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 group-hover:bg-brand-primary/5 transition-colors" />

                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                    <Globe size={24} />
                                </div>
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    site.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                                )}>
                                    {site.status}
                                </span>
                            </div>

                            <div className="relative">
                                <h3 className="text-lg font-black text-slate-900 mb-1 truncate">{site.site_name}</h3>
                                <a href={site.site_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 font-medium text-xs hover:text-brand-primary transition-colors flex items-center gap-1 mb-6">
                                    {site.domain || site.subdomain + '.izyboost.com'}
                                    <ExternalLink size={10} />
                                </a>

                                <div className="grid grid-cols-2 gap-3">
                                    <button className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group/btn">
                                        <Palette size={16} className="group-hover/btn:text-brand-primary transition-colors" /> Branding
                                    </button>
                                    <button className="p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group/btn">
                                        <Activity size={16} className="group-hover/btn:text-emerald-500 transition-colors" /> Stats
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Empty State / Marketing
                <div className="bg-white rounded-[40px] border border-slate-100 p-8 lg:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-full left-0 bg-gradient-to-b from-brand-primary/[0.02] to-transparent pointer-events-none" />

                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <div className="h-20 w-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary mx-auto mb-4">
                            <Server size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Lancez Votre Propre Business</h2>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Louez notre plateforme technologique clé en main. Vous obtenez un site web complet, hébergé, sécurisé et connecté automatiquement à nos services. Fixez vos prix, encaissez vos clients, nous gérons la technique.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Globe className="text-brand-primary mb-2" size={24} />
                                <h4 className="font-black text-slate-900 text-sm">Domaine Perso</h4>
                                <p className="text-xs text-slate-400 mt-1">Votre marque, votre URL.</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Layers className="text-brand-primary mb-2" size={24} />
                                <h4 className="font-black text-slate-900 text-sm">Catalogue Auto</h4>
                                <p className="text-xs text-slate-400 mt-1">Services synchro auto.</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Palette className="text-brand-primary mb-2" size={24} />
                                <h4 className="font-black text-slate-900 text-sm">Personnalisable</h4>
                                <p className="text-xs text-slate-400 mt-1">Logo, couleurs, textes.</p>
                            </div>
                        </div>

                        <div className="pt-8">
                            <button onClick={() => setIsCreating(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3 mx-auto">
                                Voir les offres (À partir de 3 000 F/mois)
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Creation Modal */}
            <AnimatePresence>
                {isCreating && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
                            onClick={() => !processing && setIsCreating(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[32px] shadow-2xl z-50 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
                        >
                            <button
                                onClick={() => setIsCreating(false)}
                                disabled={processing}
                                className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-2xl font-black text-slate-900">Configurer votre Site</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Étape {step} sur 2</p>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-brand-primary transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            )}

                            {step === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2">Nom du site</label>
                                        <input
                                            type="text"
                                            value={formData.site_name}
                                            onChange={e => setFormData({ ...formData, site_name: e.target.value })}
                                            placeholder="Ex: Mon Meilleur Boost"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-brand-primary/20 focus:outline-none font-bold text-slate-900 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2">Sous-domaine</label>
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={formData.subdomain}
                                                onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                placeholder="mon-agence"
                                                className="flex-1 h-12 pl-4 pr-2 rounded-l-xl bg-slate-50 border-2 border-r-0 border-slate-50 focus:bg-white focus:border-brand-primary/20 focus:outline-none font-bold text-slate-900 transition-all text-right"
                                            />
                                            <div className="h-12 px-4 flex items-center justify-center bg-slate-100 border-2 border-slate-100 rounded-r-xl text-slate-500 font-bold text-sm">
                                                .izyboost.com
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2">Modèle</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {templates.map(tpl => (
                                                <div
                                                    key={tpl.id}
                                                    onClick={() => setFormData({ ...formData, template_id: tpl.id })}
                                                    className={cn(
                                                        "p-4 rounded-xl border-2 cursor-pointer transition-all text-center",
                                                        formData.template_id === tpl.id ? "border-brand-primary bg-brand-primary/[0.03]" : "border-slate-100 hover:border-slate-200"
                                                    )}
                                                >
                                                    <div className="h-8 w-8 mx-auto bg-slate-200 rounded-lg mb-2" />
                                                    <p className="font-bold text-slate-900 text-sm">{tpl.name}</p>
                                                </div>
                                            ))}
                                            {templates.length === 0 && <p className="text-sm text-slate-400 italic col-span-2">Chargement des modèles...</p>}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.site_name || !formData.subdomain || !formData.template_id}
                                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        Continuer <ExternalLink size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2">Fréquence de facturation</label>
                                        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
                                            {['monthly', 'yearly'].map(interval => (
                                                <button
                                                    key={interval}
                                                    onClick={() => setFormData({ ...formData, interval })}
                                                    className={cn(
                                                        "py-2 rounded-lg text-sm font-black transition-all",
                                                        formData.interval === interval ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    {interval === 'monthly' ? 'Mensuel' : 'Annuel (-50%)'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setFormData({ ...formData, custom_domain: !formData.custom_domain })}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                            formData.custom_domain ? "border-brand-primary bg-brand-primary/[0.03]" : "border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors",
                                            formData.custom_domain ? "bg-brand-primary border-brand-primary text-white" : "border-slate-300"
                                        )}>
                                            {formData.custom_domain && <Check size={14} strokeWidth={4} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Nom de domaine personnalisé</p>
                                            <p className="text-xs text-slate-500 mt-1">Utilisez votre propre .com/.net (+ {PRICING.customDomainFee.toLocaleString()} F)</p>
                                        </div>
                                    </div>

                                    {formData.custom_domain && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest ml-2">Votre domaine</label>
                                            <input
                                                type="text"
                                                value={formData.domain_name}
                                                onChange={e => setFormData({ ...formData, domain_name: e.target.value })}
                                                placeholder="exemple.com"
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-brand-primary/20 focus:outline-none font-bold text-slate-900 transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="bg-slate-50 p-6 rounded-2xl space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Abonnement ({formData.interval === 'monthly' ? 'Mois' : 'An'})</span>
                                            <span className="font-bold text-slate-900">{(formData.interval === 'monthly' ? PRICING.monthly : PRICING.yearly).toLocaleString()} FCFA</span>
                                        </div>
                                        {formData.custom_domain && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 font-medium">Frais Domaine</span>
                                                <span className="font-bold text-slate-900">{PRICING.customDomainFee.toLocaleString()} FCFA</span>
                                            </div>
                                        )}
                                        <div className="h-px bg-slate-200 my-2" />
                                        <div className="flex justify-between text-base">
                                            <span className="text-slate-900 font-black">Total à payer</span>
                                            <span className="font-black text-brand-primary">{calculateTotal().toLocaleString()} FCFA</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setStep(1)}
                                            disabled={processing}
                                            className="h-14 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Retour
                                        </button>
                                        <button
                                            onClick={handlePurchase}
                                            disabled={processing || (formData.custom_domain && !formData.domain_name)}
                                            className="h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2"
                                        >
                                            {processing ? (
                                                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    Payer & Créer <Zap size={18} className="fill-brand-primary text-brand-primary" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
