import React, { useEffect, useState } from 'react';
import { Play, Youtube, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { adminApi } from '../features/admin/adminApi';
import { cn } from '../utils/cn';

export default function TutorialCTA({ variant = 'horizontal', className }) {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await adminApi.getPublicSettings();
                const obj = {};
                data.forEach(s => obj[s.key] = s.value);
                setSettings(obj);
            } catch (err) {
                console.error("TutorialCTA: Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const tutorials = [
        {
            title: "Voir comment lancer les boostages",
            description: "Apprenez à utiliser notre plateforme en moins de 2 minutes.",
            link: settings.youtube_tutorial_video || settings.youtube_link,
            icon: Play,
            color: "from-orange-500 to-rose-500",
            bg: "bg-orange-50",
            text: "text-orange-600"
        },
        {
            title: "Comment avoir des milliers d'abonnés",
            description: "Découvrez les stratégies pour faire exploser vos réseaux sociaux.",
            link: settings.youtube_growth_video || settings.youtube_link,
            icon: Sparkles,
            color: "from-emerald-500 to-teal-500",
            bg: "bg-emerald-50",
            text: "text-emerald-600"
        }
    ];

    if (variant === 'footer') {
        return (
            <div className={cn("space-y-4", className)}>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Tutoriels</h4>
                <div className="space-y-3">
                    {tutorials.map((item, i) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                        >
                            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", item.bg, item.text)}>
                                <item.icon size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-1">{item.title}</p>
                                <p className="text-[10px] text-slate-400 font-medium">Voir sur YouTube</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    if (variant === 'grid') {
        return (
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
                {tutorials.map((item, i) => (
                    <a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative overflow-hidden group rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                    >
                        <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br", item.color)} />

                        <div className="relative z-10 flex items-start gap-5">
                            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg", item.bg, item.text)}>
                                <item.icon size={28} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-brand-primary transition-colors italic uppercase tracking-tight">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4">
                                    {item.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                    Découvrir maintenant
                                    <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden group rounded-[32px] bg-slate-900 p-8 md:p-10 shadow-2xl", className)}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 blur-[100px] -mr-48 -mt-48 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 blur-[80px] -ml-32 -mb-32 rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-white/5">
                        <Zap size={10} className="text-orange-400 fill-orange-400" />
                        Accélérez votre succès
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
                        Apprenez à dominer les algorithmes <br className="hidden lg:block" />
                        <span className="text-brand-primary">avec nos tutoriels exclusifs.</span>
                    </h2>
                    <p className="text-slate-400 font-medium text-lg max-w-xl">
                        Des guides étape par étape pour utiliser la plateforme et faire exploser vos statistiques sociales.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 shrink-0 w-full md:w-auto">
                    {tutorials.map((item, i) => (
                        <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group/item min-w-[280px]"
                        >
                            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-transform group-hover/item:scale-110", item.bg, item.text)}>
                                <item.icon size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white group-hover/item:text-brand-primary transition-colors">{item.title}</p>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                    <Youtube size={12} className="text-rose-500" />
                                    Regarder l'épisode
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
