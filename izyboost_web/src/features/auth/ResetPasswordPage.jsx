import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authApi } from './authApi';
import { Lock, Loader2, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import SEO from '../../components/SEO';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Lien invalide ou expiré. Veuillez refaire une demande.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await authApi.resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/auth/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <AuthLayout
                title="Succès !"
                subtitle="Votre mot de passe a été réinitialisé avec succès."
            >
                <div className="text-center space-y-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto"
                    >
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </motion.div>

                    <p className="text-slate-500 font-medium">
                        Vous allez être redirigé vers la page de connexion...
                    </p>

                    <div className="pt-8">
                        <Link to="/auth/login" className="text-brand-primary font-black hover:underline">
                            Se connecter maintenant
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Nouveau mot de passe"
            subtitle="Choisissez un mot de passe robuste pour sécuriser votre compte."
        >
            <SEO
                title="Réinitialisation du mot de passe"
                description="Définissez un nouveau mot de passe pour votre compte IzyBoost."
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
                        Nouveau mot de passe
                    </label>
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

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Confirmer le mot de passe
                    </label>
                    <div className="relative group">
                        <ShieldCheck size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="password"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || error.includes('Lien invalide')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center group h-[64px]"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span className="text-lg">Changer mon mot de passe</span>
                            <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </AuthLayout>
    );
}
