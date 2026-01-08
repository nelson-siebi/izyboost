import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    Save, Loader2, Globe, Mail, Lock, Shield,
    Facebook, Instagram, Smartphone, Zap,
    Check, X as XIcon, LayoutDashboard, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const tabs = [
        { id: 'general', label: 'Général', icon: LayoutDashboard },
        { id: 'social', label: 'Social & Contact', icon: Globe },
        { id: 'security', label: 'Système & Sécurité', icon: Shield },
    ];

    const settingsConfig = {
        general: [
            { key: 'site_name', label: 'Nom de la Plateforme', type: 'text', placeholder: 'IzyBoost', icon: Globe },
            { key: 'site_description', label: 'Description SEO Global', type: 'textarea', placeholder: 'La plateforme N°1 pour...', icon: null },
            { key: 'contact_email', label: 'Email de Contact Officiel', type: 'email', placeholder: 'contact@izyboost.com', icon: Mail },
        ],
        social: [
            { key: 'whatsapp_number', label: 'Numéro WhatsApp (Support)', type: 'text', placeholder: '+237690000000', icon: Smartphone },
            { key: 'tiktok_link', label: 'Lien TikTok', type: 'text', placeholder: 'https://tiktok.com/@...', icon: Smartphone },
            { key: 'telegram_link', label: 'Canal Telegram', type: 'text', placeholder: 'https://t.me/...', icon: Send },
            { key: 'facebook_link', label: 'Page Facebook', type: 'text', placeholder: 'https://facebook.com/...', icon: Facebook },
            { key: 'instagram_link', label: 'Compte Instagram', type: 'text', placeholder: 'https://instagram.com/...', icon: Instagram },
        ],
        security: [
            { key: 'maintenance_mode', label: 'Mode Maintenance', type: 'toggle', description: 'Rend le site inaccessible aux utilisateurs non-admin.' },
            { key: 'enable_registration', label: 'Inscriptions Ouvertes', type: 'toggle', description: 'Autoriser les nouveaux utilisateurs à créer un compte.' },
            { key: 'min_deposit', label: 'Dépôt Minimum (FCFA)', type: 'number', placeholder: '500', icon: Lock, description: 'Montant minimum requis pour recharger un compte.' },
        ],
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await adminApi.getSettings();
            const settingsObj = {};
            data.forEach(setting => {
                // Convert toggle strings to booleans if needed, though usually handled by backend
                // Assuming backend sends '1'/'0' or true/false. Let's handle generic values.
                settingsObj[setting.key] = setting.value;
            });
            setSettings(settingsObj);
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key, value) => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await adminApi.updateSetting(key, value);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            // Using a simple alert for error, but UI for success is handled
            console.error('Save failed', error);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleBlur = (key) => {
        handleSave(key, settings[key]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-orange-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="h-6 w-6 text-slate-300 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Modern Header - Light Theme */}
            <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-100 p-8 md:p-12 shadow-xl shadow-slate-200/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 blur-[40px] rounded-full -ml-16 -mb-16 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                                Administration
                            </span>
                            {saving && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 animate-pulse">
                                    <Loader2 size={10} className="animate-spin text-orange-500" /> Sauvegarde...
                                </span>
                            )}
                            {saveSuccess && (
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                                    <Check size={10} /> Enregistré
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Configuration</h1>
                        <p className="text-slate-500 font-medium mt-2 max-w-lg">
                            Pilotez les paramètres globaux de IzyBoost, des réseaux sociaux aux protocoles de sécurité.
                        </p>
                    </div>
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-200 flex items-center justify-center text-white">
                        <Zap className="h-8 w-8 fill-white/20" />
                    </div>
                </div>
            </div>

            {/* Animated Tabs */}
            <div className="flex p-1 gap-1 bg-white border border-slate-100 rounded-2xl w-fit mx-auto md:mx-0 overflow-x-auto max-w-full shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all z-10 whitespace-nowrap",
                                activeTab === tab.id ? "text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="active-tab-pill"
                                    className="absolute inset-0 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20 -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon size={16} className={cn("transition-transform", activeTab === tab.id ? "scale-110" : "")} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {settingsConfig[activeTab].map((setting) => (
                        <div
                            key={setting.key}
                            className={cn(
                                "group bg-white border border-slate-100 p-6 rounded-[24px] hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300",
                                setting.type === 'textarea' ? "md:col-span-2 lg:col-span-3" : ""
                            )}
                        >
                            {setting.type === 'toggle' ? (
                                <div className="flex items-center justify-between gap-4 h-full">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                                            {setting.label}
                                        </label>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[200px] md:max-w-none">
                                            {setting.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newValue = !settings[setting.key];
                                            handleChange(setting.key, newValue);
                                            handleSave(setting.key, newValue);
                                        }}
                                        className={cn(
                                            "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                                            settings[setting.key] ? 'bg-emerald-500' : 'bg-slate-200'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center",
                                                settings[setting.key] ? 'translate-x-6' : 'translate-x-0'
                                            )}
                                        >
                                            {settings[setting.key] ? (
                                                <Check size={14} className="text-emerald-600 stroke-[4px]" />
                                            ) : (
                                                <XIcon size={14} className="text-slate-400 stroke-[3px]" />
                                            )}
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-500 transition-colors ml-1">
                                        {setting.label}
                                    </label>

                                    {setting.type === 'textarea' ? (
                                        <textarea
                                            value={settings[setting.key] || ''}
                                            onChange={(e) => handleChange(setting.key, e.target.value)}
                                            onBlur={() => handleBlur(setting.key)}
                                            placeholder={setting.placeholder}
                                            rows={3}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                                        />
                                    ) : (
                                        <div className="relative group/input">
                                            {setting.icon && (
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-orange-500 transition-colors">
                                                    <setting.icon size={18} />
                                                </div>
                                            )}
                                            <input
                                                type={setting.type}
                                                value={settings[setting.key] || ''}
                                                onChange={(e) => handleChange(setting.key, e.target.value)}
                                                onBlur={() => handleBlur(setting.key)}
                                                placeholder={setting.placeholder}
                                                className={cn(
                                                    "w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all",
                                                    setting.icon ? "pl-11 pr-4" : "px-4"
                                                )}
                                            />
                                        </div>
                                    )}
                                    {setting.description && (
                                        <p className="text-xs text-slate-400 font-medium pl-1">{setting.description}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
