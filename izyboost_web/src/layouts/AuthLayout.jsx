import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Globe } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden font-sans">
            {/* Left Side: Branding and Visuals (Visible on desktop) */}
            <div className="hidden md:flex md:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/40 to-transparent z-10" />

                {/* Animated Background Shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-80 h-80 border-2 border-brand-primary/10 rounded-[4rem] z-0"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-brand-primary/5 rounded-full blur-3xl z-0"
                />

                <div className="relative z-20 text-white max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-6xl font-black tracking-tight text-white mb-6">
                            Izy<span className="text-brand-primary">Boost</span>
                        </h1>
                        <p className="text-xl text-slate-400 mb-12 font-medium leading-relaxed">
                            La plateforme SMM la plus rapide et sécurisée pour propulser votre présence digitale au sommet.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {[
                            { icon: Zap, text: "Livraison instantanée sur tous nos services", color: "text-amber-400" },
                            { icon: ShieldCheck, text: "Sécurité bancaire avec Nelsius Pay", color: "text-emerald-400" },
                            { icon: Globe, text: "Support multilingue disponible 24/7", color: "text-sky-400" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (i * 0.1) }}
                                className="flex items-center space-x-5"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                    <feature.icon size={24} className={feature.color} />
                                </div>
                                <span className="text-lg font-semibold text-slate-300">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side: Auth Forms */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white relative">
                <div className="absolute top-8 left-8 md:hidden">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">
                        IZY<span className="text-brand-primary">BOOST</span>
                    </span>
                </div>

                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-10 text-center md:text-left"
                    >
                        <h2 className="text-3xl font-black text-slate-900 mb-3">{title}</h2>
                        <p className="text-slate-500 font-medium">{subtitle}</p>
                    </motion.div>

                    {children}
                </div>
            </div>
        </div>
    );
}
