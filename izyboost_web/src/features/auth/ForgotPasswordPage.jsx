import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from './authApi';
import { Mail, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

import AuthLayout from '../../layouts/AuthLayout';
import SEO from '../../components/SEO';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authApi.forgotPassword(email);
            setIsSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du mail.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        return (
            <AuthLayout
                title="Email Envoyé !"
                subtitle="Consultez votre boîte mail pour réinitialiser votre mot de passe."
            >
                <div className="text-center space-y-8">
                    <div
                        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto animate-[bounce-in_0.5s_ease-out]"
                    >
                        <CheckCircle2 size={48} className="text-emerald-500" />
                    </div>

                    <p className="text-slate-500 font-medium leading-relaxed">
                        Si un compte existe pour <strong>{email}</strong>, vous allez recevoir un lien de réinitialisation d'ici quelques instants.
                    </p>

                    <div className="pt-8">
                        <Link to="/auth/login" className="inline-flex items-center text-slate-900 font-black hover:gap-3 transition-all gap-2">
                            <ArrowLeft size={20} />
                            Retour à la connexion
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Mot de passe oublié ?"
            subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
        >
            <SEO
                title="Mot de passe oublié"
                description="Réinitialisez votre mot de passe pour retrouver l'accès à vos services."
            />
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div
                        className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center animate-[fade-in_0.3s_ease-out]"
                    >
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                        Votre Email
                    </label>
                    <div className="relative group">
                        <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="email"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 focus:ring-4 focus:ring-brand-primary/5 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                            placeholder="votre@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center h-[64px]"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <span className="text-lg">Envoyer le lien</span>
                    )}
                </button>

                <div className="text-center pt-8">
                    <Link to="/auth/login" className="inline-flex items-center text-slate-400 font-bold hover:text-slate-900 transition-colors gap-2 text-sm">
                        <ArrowLeft size={16} />
                        Retour à la connexion
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
