import { ShieldCheck, Zap, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminApi } from '../features/admin/adminApi';
import apiClient from '../api/client';

export default function AuthLayout({ children, title, subtitle }) {
    const [siteLogo, setSiteLogo] = useState(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const data = await adminApi.getPublicSettings();
                const logo = data.find(s => s.key === 'site_logo')?.value;
                if (logo) setSiteLogo(logo);
            } catch (err) {
                console.error("AuthLayout: Failed to fetch logo", err);
            }
        };
        fetchLogo();
    }, []);

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Side: Branding and Visuals (Visible on desktop) */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent z-10" />

                {/* Animated Background Shapes */}
                <div
                    className="absolute -top-20 -left-20 w-80 h-80 border-2 border-brand-primary/10 rounded-[4rem] z-0 animate-[spin_50s_linear_infinite]"
                />
                <div
                    className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-brand-primary/5 rounded-full blur-3xl z-0 animate-[spin_40s_linear_infinite_reverse]"
                />

                <div className="relative z-20 text-white max-w-lg">
                    <div>
                        {siteLogo ? (
                            <img src={resolveImgUrl(siteLogo)} alt="Logo" className="h-12 w-auto mb-10 object-contain drop-shadow-2xl" />
                        ) : (
                            <img src="/logo1.png" alt="Logo" className="h-16 w-auto mb-10 object-contain drop-shadow-2xl" />
                        )}
                        <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed">
                            La plateforme SMM la plus rapide et sécurisée pour propulser votre présence digitale au sommet.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {[
                            { icon: Zap, text: "Livraison instantanée sur tous nos services", color: "text-amber-400" },
                            { icon: ShieldCheck, text: "Sécurité bancaire avec Nelsius Pay", color: "text-emerald-400" },
                            { icon: Globe, text: "Support multilingue disponible 24/7", color: "text-sky-400" }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="flex items-center space-x-5"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <feature.icon size={24} className={feature.color} />
                                </div>
                                <span className="text-lg font-semibold text-slate-300">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Forms */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white relative pt-24 md:pt-6">
                <div className="absolute top-8 left-8 md:hidden">
                    {siteLogo ? (
                        <img src={resolveImgUrl(siteLogo)} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <img src="/logo1.png" alt="Logo" className="h-8 w-auto object-contain" />
                    )}
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{title}</h2>
                        <p className="text-slate-500 font-medium">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
