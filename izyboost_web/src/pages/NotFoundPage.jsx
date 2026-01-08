import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-brand-primary/10 rounded-full blur-3xl animate-pulse" />
                    <h1 className="text-[120px] font-black text-slate-100 leading-none relative z-10">404</h1>
                    <AlertCircle className="text-brand-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24" />
                </motion.div>

                <h2 className="text-3xl font-black text-slate-900 mb-4">Oups ! Page introuvable</h2>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                    Il semble que le service que vous recherchez ait été déplacé ou n'existe plus.
                    Laissez-nous vous ramener sur le bon chemin.
                </p>

                <div className="flex flex-col space-y-4">
                    <Link
                        to="/"
                        className="flex items-center justify-center space-x-3 bg-brand-primary hover:bg-brand-secondary text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
                    >
                        <Home size={20} />
                        <span>Retour à l'accueil</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center space-x-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                    >
                        <ArrowLeft size={18} />
                        <span>Page précédente</span>
                    </button>
                </div>

                <div className="mt-12 text-slate-300 font-bold tracking-widest text-xs uppercase">
                    IzyBoost - Elite SMM Services
                </div>
            </div>
        </div>
    );
}
