// Last updated: 2026-01-10 14:59
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Zap,
    ShieldCheck,
    Globe,
    Users,
    ArrowRight,
    CheckCircle2,
    Smartphone,
    BarChart,
    Smartphone as MobileIcon,
    ChevronDown,
    Plus,
    LayoutGrid,
    DollarSign,
    Heart,
    Star,
    Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../utils/cn';
import SEO from '../components/SEO';
import LandingLayout from '../layouts/LandingLayout';

const features = [
    {
        icon: Zap,
        title: "Boost Instantané",
        desc: "Démarrage immédiat sur la majorité de nos services. Gagnez du temps et voyez vos chiffres grimper en quelques minutes.",
        color: "bg-blue-50 text-blue-600",
        delay: 0.1
    },
    {
        icon: ShieldCheck,
        title: "Sécurité Maximale",
        desc: "Aucun mot de passe requis. Nous utilisons des méthodes sûres qui respectent les algorithmes des réseaux sociaux.",
        color: "bg-emerald-50 text-emerald-600",
        delay: 0.2
    },
    {
        icon: Globe,
        title: "Portée Mondiale",
        desc: "Touchez des audiences réelles en Afrique et à l'international pour une croissance organique et crédible.",
        color: "bg-indigo-50 text-indigo-600",
        delay: 0.3
    }
];

const faqs = [
    {
        q: "Est-ce que c'est risqué pour mon compte ?",
        a: "Absolument pas. IzyBoost utilise des méthodes de promotion conformes aux politiques des plateformes. Nous n'avons jamais besoin de vos identifiants de connexion."
    },
    {
        q: "Combien de temps prend la livraison ?",
        a: "La plupart des services commencent instantanément après validation. Le délai total dépend de la quantité commandée pour garantir un aspect naturel."
    },
    {
        q: "Comment puis-je recharger mon compte ?",
        a: "Nous acceptons Orange Money, MTN Mobile Money et les cartes bancaires via nos passerelles de paiement sécurisées."
    },
    {
        q: "Proposez-vous un support client ?",
        a: "Oui, notre équipe est disponible 24/7 via le système de tickets interne et WhatsApp pour répondre à toutes vos questions."
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isInitializing } = useAuthStore();
    const [scrolled, setScrolled] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    useEffect(() => {
        // Only redirect IF we are authenticated AND the initial profile check is done
        // This prevents stale tokens from triggering a redirect before we know they are valid
        if (isAuthenticated && !isInitializing) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, isInitializing, navigate]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white selection:bg-brand-primary/20 selection:text-brand-primary">
            <SEO
                title="Accueil"
                description="IzyBoost est la plateforme #1 de Social Media Marketing en Afrique. Boostez vos followers, likes et vues sur Instagram, TikTok, Facebook et YouTube."
                keywords="smm panel cameroun, boost instagram, abonnés tiktok, marketing réseaux sociaux, izyboost"
            />

            {/* Sticky Navigation Area (Will be handled by LandingLayout, but adding here as placeholder or just using regular padding) */}

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-6">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full" />
                </div>

                <div className="max-w-[1240px] mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20"
                    >
                        <Zap size={14} className="text-brand-primary animate-pulse" />
                        LA RÉFÉRENCE DU SMM EN AFRIQUE
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight px-4"
                    >
                        Devenez <span className="text-brand-primary italic">Incontournable</span> <br />
                        sur les réseaux.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-base sm:text-lg lg:text-xl text-slate-500 font-medium max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        Propulsez votre influence avec des services de haute qualité, une livraison ultra-rapide et un support client exceptionnel. Rejoignez plus de 10 000 créateurs et entreprises.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    >
                        <Link
                            to="/auth/register"
                            className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-brand-primary/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            Démarrer maintenant <ArrowRight size={22} strokeWidth={3} />
                        </Link>
                        <Link
                            to="/auth/login"
                            className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[24px] font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                        >
                            Voir les tarifs
                        </Link>
                    </motion.div>

                    {/* Social Proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="pt-16 flex flex-wrap justify-center items-center gap-8 lg:gap-16 opacity-40 grayscale"
                    >
                        <p className="w-full text-xs font-black text-slate-400 uppercase tracking-widest mb-4">PLUS DE 500 SERVICES DISPONIBLES SUR</p>
                        <div className="flex items-center gap-3"><Users size={24} /> <span className="font-black text-xl tracking-tighter">INSTAGRAM</span></div>
                        <div className="flex items-center gap-3"><Zap size={24} /> <span className="font-black text-xl tracking-tighter">TIKTOK</span></div>
                        <div className="flex items-center gap-3"><Heart size={24} /> <span className="font-black text-xl tracking-tighter">FACEBOOK</span></div>
                        <div className="flex items-center gap-3"><Star size={24} /> <span className="font-black text-xl tracking-tighter">YOUTUBE</span></div>
                    </motion.div>
                </div>
            </section>

            {/* stats grid marquee style or simple grid */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { value: "500K+", label: "Commandes" },
                            { value: "15K+", label: "Utilisateurs" },
                            { value: "99.9%", label: "Satisfaction" },
                            { value: "24/7", label: "Support" },
                        ].map((item, i) => (
                            <div key={i} className="text-center group">
                                <p className="text-4xl lg:text-6xl font-black text-brand-primary mb-2 group-hover:scale-110 transition-transform">{item.value}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto lg:px-12">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="flex-1 space-y-6">
                            <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">POURQUOI NOUS CHOISIR ?</h2>
                            <h3 className="text-4xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                                La technologie au service de votre <span className="text-brand-primary italic">croissance</span>.
                            </h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                IzyBoost n'est pas qu'un simple panneau SMM. C'est un partenaire stratégique qui utilise les meilleures API mondiales pour vous garantir un service irréprochable.
                            </p>
                            <div className="pt-8 space-y-4">
                                {features.map((feature, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all"
                                    >
                                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", feature.color)}>
                                            <feature.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm italic">{feature.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{feature.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 relative order-first lg:order-last">
                            <div className="aspect-[4/5] bg-brand-primary rounded-[64px] overflow-hidden relative shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 mix-blend-multiply" alt="Support" />
                                <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent text-white space-y-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-brand-primary text-brand-primary" />)}
                                    </div>
                                    <p className="text-2xl font-black italic">"Une expérience incroyable. Mon engagement a triplé en moins de 48h !"</p>
                                    <p className="font-bold opacity-70">— Marc K., Influenceur Gaming</p>
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-10 -right-10 h-32 w-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-6 border border-slate-100 hidden md:flex">
                                <Smartphone size={40} className="text-brand-primary animate-bounce-slow" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-4 hidden md:block">
                                <div className="flex -space-x-3 mb-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-10 w-10 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                                        </div>
                                    ))}
                                    <div className="h-10 w-10 rounded-full border-4 border-slate-900 bg-brand-primary flex items-center justify-center text-[10px] font-black">+2k</div>
                                </div>
                                <p className="text-xs font-bold">Trusted by 2000+ new creators this month</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-32 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primary/10 blur-[150px] -mr-40 -mt-40 rounded-full" />

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center space-y-20">
                    <div className="space-y-4">
                        <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">QUEL EST LE PROCESSUS ?</h2>
                        <h3 className="text-4xl lg:text-6xl font-black leading-tight italic">Trois étapes vers le <span className="text-brand-primary">sommet</span>.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/4 left-0 w-full h-0.5 bg-white/5 hidden md:block" />

                        {[
                            { icon: UserPlus, title: "Inscription", desc: "Créez votre compte en 1 minute. Simple, rapide et sécurisé." },
                            { icon: DollarSign, title: "Recharge", desc: "Ajoutez des fonds via OM, MoMo ou Carte pour commander." },
                            { icon: Award, title: "Booster", desc: "Choisissez vos services et regardez votre audience exploser." },
                        ].map((step, i) => (
                            <div key={i} className="relative space-y-6 group">
                                <div className="h-24 w-24 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[40px] flex items-center justify-center mx-auto group-hover:bg-brand-primary group-hover:scale-110 transition-all duration-500">
                                    <step.icon size={40} className="text-brand-primary group-hover:text-white transition-colors" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black tracking-tight">{step.title}</h4>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-[250px] mx-auto">{step.desc}</p>
                                </div>
                                <div className="absolute -top-4 -right-2 text-6xl font-black text-white/5 select-none">{i + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-xs font-black text-brand-primary uppercase tracking-[0.3em]">DES QUESTIONS ?</h2>
                        <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight italic">On vous répond en toute <br /> <span className="text-brand-primary">transparence</span>.</h3>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "rounded-[32px] border transition-all duration-300 overflow-hidden",
                                    openFaq === i ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                                    className="w-full p-8 flex items-center justify-between text-left gap-4"
                                >
                                    <span className="text-lg font-black text-slate-900 italic">{faq.q}</span>
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-300",
                                        openFaq === i ? "bg-slate-900 text-white rotate-180" : "bg-slate-100 text-slate-400"
                                    )}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-8 pb-8"
                                        >
                                            <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer / CTA Area (Footer will be handled by Layout) */}
        </div>
    );
}

const UserPlus = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
);
