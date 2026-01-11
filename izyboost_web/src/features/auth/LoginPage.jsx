import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from './authApi';
import { LogIn, User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import SEO from '../../components/SEO';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await authApi.login({ email, password });
            setAuth(data.user, data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants invalides');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Content de vous revoir !"
            subtitle="Connectez-vous pour gérer vos commandes et services."
        >
            <SEO
                title="Connexion"
                description="Connectez-vous à votre compte IzyBoost pour gérer vos boosts et suivre vos commandes."
            />
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                        {error}
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Email ou Utilisateur
                    </label>
                    <div className="relative group">
                        <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Mot de passe
                        </label>
                        <Link to="/auth/forgot-password" title="Mot de passe oublié" className="text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors">Perdu ?</Link>
                    </div>
                    <div className="relative group">
                        <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="password"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center group h-[64px]"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span className="text-lg">Démarrer la session</span>
                            <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <div className="text-center pt-8">
                    <p className="text-slate-500 font-medium">
                        Pas encore de compte ?{' '}
                        <Link to="/auth/register" className="text-brand-primary font-black hover:underline underline-offset-4 decoration-2">
                            Créer mon espace
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
