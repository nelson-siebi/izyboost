import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from './authApi';
import { User, Lock, Mail, Loader2, ArrowRight, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthLayout from '../../layouts/AuthLayout';
import SEO from '../../components/SEO';

export default function RegisterPage() {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        sponsor_code: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            setFormData(prev => ({ ...prev, sponsor_code: ref }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await authApi.register(formData);
            setAuth(data.user, data.access_token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l’inscription');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AuthLayout
            title="Créer votre compte"
            subtitle="Rejoignez la communauté IzyBoost et booster vos réseaux."
        >
            <SEO
                title="Créer un compte"
                description="Rejoignez IzyBoost pour booster votre influence sur les réseaux sociaux. Inscription rapide et sécurisée."
            />
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Identifiant unique</label>
                        <div className="relative group">
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                name="username"
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                                placeholder="pseudo_boost"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Code de Parrainage (Optionnel)</label>
                        <div className="relative group">
                            <Gift size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                name="sponsor_code"
                                type="text"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                                placeholder="CODE123"
                                value={formData.sponsor_code}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Adresse Email</label>
                    <div className="relative group">
                        <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                            placeholder="contact@votre-domaine.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mot de passe</label>
                        <div className="relative group">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirmation</label>
                        <div className="relative group">
                            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors" />
                            <input
                                name="password_confirmation"
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-brand-primary/30 outline-none transition-all placeholder:text-slate-300 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold"
                                placeholder="••••••••"
                                value={formData.password_confirmation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 mt-4 flex items-center justify-center space-x-3 h-[64px]"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span className="text-lg">Finaliser l'inscription</span>
                            <ArrowRight size={22} className="group-hover:translate-x-1" />
                        </>
                    )}
                </button>

                <div className="text-center pt-6">
                    <p className="text-slate-500 font-medium">
                        Déjà membre ?{' '}
                        <Link to="/auth/login" className="text-brand-primary font-black hover:underline underline-offset-4 decoration-2">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}
