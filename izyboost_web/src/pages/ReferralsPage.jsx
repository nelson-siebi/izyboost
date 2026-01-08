import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Users, DollarSign, TrendingUp, Gift } from 'lucide-react';
import { referralsApi } from '../features/common/extraApi';
import { cn } from '../utils/cn';

export default function ReferralsPage() {
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(true);

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
            setLink(linkData.referral_link || linkData.link || 'https://izyboost.com/ref/wafo'); // Fallback
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        // Add toast logic here
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Programme d'Affiliation</h1>
                <p className="text-slate-500 font-medium mt-1">Gagnez de l'argent en invitant vos amis sur IzyBoost.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Visiteurs', value: stats?.visitors || 0, icon: Users, color: 'text-blue-500 bg-blue-50' },
                    { label: 'Inscrits', value: stats?.signups || 0, icon: UserPlus, color: 'text-indigo-500 bg-indigo-50' },
                    { label: 'Taux Conv.', value: `${stats?.conversion_rate || 0}%`, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
                    { label: 'Gains Totaux', value: `${(stats?.total_earnings || 0).toLocaleString()} F`, icon: DollarSign, color: 'text-brand-primary bg-brand-primary/10' },
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
                {/* Share Link Section */}
                <div className="lg:col-span-5 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 space-y-6">
                        <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Gift size={28} className="text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black mb-2">Partagez votre lien</h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Recevez <span className="text-brand-primary font-bold">5%</span> de bonus sur chaque dépôt effectué par vos filleuls, à vie !
                            </p>
                        </div>

                        <div className="bg-white/5 p-2 rounded-2xl border border-white/10 flex items-center gap-2">
                            <div className="bg-slate-900 overflow-hidden px-4 py-3 rounded-xl flex-1 truncate font-mono text-sm text-slate-300 border border-slate-800">
                                {link}
                            </div>
                            <button onClick={copyLink} className="h-11 w-11 bg-brand-primary rounded-xl flex items-center justify-center text-white shrink-0 hover:bg-brand-primary/90 transition-colors">
                                <Copy size={20} />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-[#1877F2] rounded-xl flex items-center justify-center text-white hover:bg-[#1864F2] transition-colors"><div className='font-black text-xs'>FACEBOOK</div></button>
                            <button className="flex-1 py-3 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:bg-[#20bd5a] transition-colors"><div className='font-black text-xs'>WHATSAPP</div></button>
                        </div>
                    </div>
                </div>

                {/* Referrals List */}
                <div className="lg:col-span-7 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-slate-400" />
                        Derniers Filleuls
                    </h3>

                    <div className="space-y-4">
                        {referrals.length > 0 ? (
                            referrals.map(ref => (
                                <div key={ref.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-slate-400 text-xs">
                                            {ref.username?.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{ref.username}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-400">{new Date(ref.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-brand-primary text-sm">+{parseFloat(ref.earnings || 0).toLocaleString()} F</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Commission</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                                    <Users size={32} className="text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm">Aucun filleul pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icons
const UserPlus = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
);
