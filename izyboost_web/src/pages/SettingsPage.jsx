import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    Bell,
    Shield,
    LogOut,
    ChevronRight,
    Moon,
    Globe,
    Save,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { userApi } from '../features/auth/userApi';
import { cn } from '../utils/cn';

export default function SettingsPage() {
    const { user, logout, setUser } = useAuthStore();
    const [activeSection, setActiveSection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Profile Form
    const [profileData, setProfileData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });

    // Password Form
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [showPasswords, setShowPasswords] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const res = await userApi.updateProfile(profileData);
            setUser(res.user);
            setMessage('Profil mis à jour avec succès !');
            setTimeout(() => setActiveSection(null), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            await userApi.updatePassword(passwordData);
            setMessage('Mot de passe mis à jour !');
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            setTimeout(() => setActiveSection(null), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Mot de passe actuel incorrect ou invalide.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle2FA = async () => {
        setLoading(true);
        try {
            const res = await userApi.toggle2FA();
            setUser(res.user);
            setMessage(res.message);
        } catch (err) {
            setError('Échec de la modification du 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleSettingToggle = async (key, current) => {
        try {
            const res = await userApi.updateSettings({ [key]: !current });
            setUser(res.user);
        } catch (err) {
            setError('Échec de la mise à jour des paramètres');
        }
    };

    const sections = [
        {
            id: 'profile',
            title: "Compte",
            items: [
                { id: 'profile', icon: User, label: "Profil Personnel", sub: "Nom d'utilisateur et Email", action: () => setActiveSection('profile') },
                { id: 'security', icon: Lock, label: "Sécurité", sub: "Modifier votre mot de passe", action: () => setActiveSection('security') },
                {
                    id: '2fa',
                    icon: Shield,
                    label: "Double Authentification",
                    sub: user?.two_factor_enabled ? "Activé" : "Désactivé",
                    isToggle: true,
                    value: user?.two_factor_enabled,
                    action: handleToggle2FA
                },
            ]
        },
        {
            id: 'prefs',
            title: "Préférences",
            items: [
                {
                    id: 'notifications',
                    icon: Bell,
                    label: "Notifications Email",
                    sub: "Recevoir des alertes par email",
                    isToggle: true,
                    value: user?.settings?.email_notifications,
                    action: () => handleSettingToggle('email_notifications', user?.settings?.email_notifications)
                },
                { id: 'appearance', icon: Moon, label: "Apparence", sub: "Mode Sombre (Bientôt)", action: () => { } },
            ]
        },
    ];

    if (activeSection === 'profile') {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} /> Retour
                </button>
                <header>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profil Personnel</h1>
                    <p className="text-slate-500 font-medium mt-1">Mettez à jour vos informations de base.</p>
                </header>

                <form onSubmit={handleUpdateProfile} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-6">
                    {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-bold text-sm">
                        <CheckCircle2 size={18} /> {message}
                    </div>}
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                        <AlertCircle size={18} /> {error}
                    </div>}

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Nom d'utilisateur</label>
                        <input
                            type="text"
                            value={profileData.username}
                            onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                            placeholder="Votre pseudo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Email</label>
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                            placeholder="votre@email.com"
                            required
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Enregistrer les modifications</>}
                    </button>
                </form>
            </div>
        );
    }

    if (activeSection === 'security') {
        return (
            <div className="max-w-xl mx-auto space-y-6">
                <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
                    <ArrowLeft size={20} /> Retour
                </button>
                <header>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sécurité</h1>
                    <p className="text-slate-500 font-medium mt-1">Changez votre mot de passe pour protéger votre compte.</p>
                </header>

                <form onSubmit={handleUpdatePassword} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 space-y-6">
                    {message && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center gap-3 font-bold text-sm">
                        <CheckCircle2 size={18} /> {message}
                    </div>}
                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
                        <AlertCircle size={18} /> {error}
                    </div>}

                    <div className="space-y-2 relative">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Mot de passe actuel</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwordData.current_password}
                            onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                            required
                        />
                    </div>

                    <div className="h-px bg-slate-100 mx-4" />

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Nouveau mot de passe</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwordData.password}
                            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-2">Confirmer le nouveau mot de passe</label>
                        <input
                            type={showPasswords ? "text" : "password"}
                            value={passwordData.password_confirmation}
                            onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                            className="w-full h-14 px-6 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-brand-primary/20 focus:bg-white outline-none font-bold text-slate-900 transition-all"
                            required
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="text-xs font-bold text-slate-400 hover:text-brand-primary flex items-center gap-2 transition-colors ml-2"
                    >
                        {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />} Afficher les mots de passe
                    </button>

                    <button
                        disabled={loading}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><Lock size={20} /> Mettre à jour le mot de passe</>}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <header>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
                <p className="text-slate-500 font-medium mt-1">Gérez votre compte et vos préférences.</p>
            </header>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-8 mb-8 flex items-center gap-6 group relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                <div className="h-20 w-20 bg-brand-primary text-white rounded-[24px] flex items-center justify-center text-3xl font-black uppercase shadow-xl shadow-brand-primary/20 relative z-10">
                    {user?.username?.[0] || 'U'}
                </div>
                <div className="relative z-10">
                    <h2 className="text-xl font-black text-slate-900">{user?.username || 'Utilisateur'}</h2>
                    <p className="text-slate-500 font-bold text-sm">{user?.email || 'email@exemple.com'}</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <Shield size={10} strokeWidth={3} /> Compte Vérifié
                    </div>
                </div>
            </div>

            {sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                    <h3 className="px-6 text-xs font-black uppercase tracking-[0.2em] text-slate-400">{section.title}</h3>
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {section.items.map((item, i) => (
                            <button
                                key={i}
                                onClick={item.isToggle ? null : item.action}
                                className={cn(
                                    "w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all text-left group",
                                    item.isToggle && "cursor-default"
                                )}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                                        <item.icon size={22} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base">{item.label}</p>
                                        <p className="text-sm text-slate-400 font-bold">{item.sub}</p>
                                    </div>
                                </div>
                                {item.isToggle ? (
                                    <div
                                        onClick={item.action}
                                        className={cn(
                                            "h-7 w-12 rounded-full p-1 transition-all cursor-pointer",
                                            item.value ? "bg-brand-primary" : "bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-5 w-5 bg-white rounded-full transition-all shadow-sm",
                                            item.value ? "translate-x-5" : "translate-x-0"
                                        )} />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-200 group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className="pt-8">
                <button
                    onClick={() => {
                        if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) logout();
                    }}
                    className="w-full bg-red-50 text-red-600 p-5 rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-[0.98]"
                >
                    <LogOut size={22} strokeWidth={3} />
                    Déconnexion
                </button>
                <div className="text-center mt-8">
                    <p className="text-[10px] font-black tracking-widest text-slate-300 uppercase">IzyBoost Platform v1.2.0 • Build 2024</p>
                </div>
            </div>
        </div>
    );
}
