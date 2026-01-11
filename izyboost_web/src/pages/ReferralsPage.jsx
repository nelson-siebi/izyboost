import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, DollarSign, TrendingUp, Gift, UserPlus, UserCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import { referralsApi } from '../features/common/extraApi';
import { cn } from '../utils/cn';

export default function ReferralsPage() {
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, listData, linkData] = await Promise.all([
                referralsApi.getStats(),
                referralsApi.getReferrals(),
                referralsApi.getLink()
            ]);
            setStats(statsData.data || statsData);
            setReferrals(listData.data || listData);
            setLink(linkData.referral_link || linkData.link || '');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Programme d'Affiliation</h1>
                    <p className="text-slate-500 font-medium mt-1">Transformez votre influence en revenus réels avec IzyBoost.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Partenariat Actif
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Filleuls Directs', value: stats?.direct_referrals || 0, icon: Users, color: 'text-blue-500 bg-blue-50' },
                    { label: 'Total Filleuls', value: stats?.total_referrals || 0, icon: UserPlus, color: 'text-indigo-500 bg-indigo-50' },
                    { label: 'Gains en Attente', value: `${(stats?.pending_commissions || 0).toLocaleString()} F`, icon: TrendingUp, color: 'text-amber-500 bg-amber-50' },
                    { label: 'Gains Totaux', value: `${(stats?.total_earned || 0).toLocaleString()} F`, icon: DollarSign, color: 'text-brand-primary bg-brand-primary/10' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.color)}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Share Link & How it Works */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Gift size={28} className="text-brand-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-2">Partagez votre lien</h2>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    Recevez <span className="text-brand-primary font-bold">{stats?.commission_rate || 5}%</span> de commission sur chaque achat effectué par vos filleuls, à vie !
                                </p>
                            </div>

                            <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center gap-2">
                                <div className="bg-slate-900 overflow-hidden px-4 py-3 rounded-xl flex-1 truncate font-mono text-sm text-slate-300 border border-slate-800">
                                    {link || 'Chargement...'}
                                </div>
                                <button
                                    onClick={copyLink}
                                    className={cn(
                                        "h-11 w-11 rounded-xl flex items-center justify-center text-white shrink-0 transition-all",
                                        copied ? "bg-emerald-500" : "bg-brand-primary hover:bg-brand-primary/90"
                                    )}
                                >
                                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 py-3 bg-[#1877F2] rounded-xl flex items-center justify-center text-white hover:bg-[#1864F2] transition-colors"><div className='font-black text-xs uppercase'>Partager sur Facebook</div></button>
                                <button className="flex-1 py-3 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:bg-[#20bd5a] transition-colors"><div className='font-black text-xs uppercase'>Partager sur WhatsApp</div></button>
                            </div>
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <h3 className="text-lg font-black text-slate-900 mb-6">Comment ça marche ?</h3>
                        <div className="space-y-6">
                            {[
                                { step: '01', title: 'Partagez', desc: 'Envoyez votre lien unique à vos amis ou partagez-le sur vos réseaux.', icon: Smartphone },
                                { step: '02', title: 'Inscription', desc: 'Vos amis s\'inscrivent sur IzyBoost via votre lien de parrainage.', icon: UserPlus },
                                { step: '03', title: 'Gagnez', desc: `Vous touchez ${stats?.commission_rate || 5}% sur chaque commande qu'ils passent.`, icon: TrendingUp },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-brand-primary font-black text-sm shrink-0">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Referrals List */}
                <div className="lg:col-span-7 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-slate-400" />
                        Derniers Filleuls
                    </h3>

                    <div className="space-y-4 flex-1">
                        {referrals.length > 0 ? (
                            referrals.map(ref => (
                                <div key={ref.id || ref.referred?.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center font-bold text-brand-primary text-sm border border-slate-100">
                                            {(ref.referred?.username || ref.username)?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{ref.referred?.username || ref.username}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                Inscrit le {new Date(ref.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center justify-end gap-1 text-emerald-600">
                                            <UserCheck size={14} />
                                            <span className="text-[10px] font-black uppercase">Actif</span>
                                        </div>
                                        <p className="font-black text-slate-900 text-sm mt-0.5">Niveau {ref.level || 1}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center transform rotate-12">
                                    <Users size={40} className="text-slate-200" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-black">Aucun filleul pour le moment</p>
                                    <p className="text-slate-400 text-xs font-medium max-w-[200px] mx-auto mt-1">
                                        Commencez à partager votre lien pour voir vos gains s'afficher ici.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 p-6 bg-brand-primary/5 rounded-[24px] border border-brand-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0">
                                <Share2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900">Astuce</h4>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">
                                    Les utilisateurs qui partagent leur lien sur WhatsApp ont 3x plus de chances de convertir !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom icons can be imported from lucide-react instead of helper functions if possible

