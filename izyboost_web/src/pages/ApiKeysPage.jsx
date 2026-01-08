import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Plus, Trash2, Copy, Shield, Code, Terminal, CheckCircle2 } from 'lucide-react';
import { developerApi } from '../features/common/supportApi';
import { cn } from '../utils/cn';

export default function ApiKeysPage() {
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newKeyName, setNewKeyName] = useState('');
    const [creating, setCreating] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = async () => {
        try {
            const data = await developerApi.getKeys();
            setKeys(data.data || data);
        } catch (error) {
            console.error('Failed to load keys', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async (e) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;

        setCreating(true);
        try {
            const newKey = await developerApi.createKey(newKeyName);
            // Depending on API, it might return the list or the single key
            // Optimistically update or reload
            loadKeys();
            setNewKeyName('');
            setNotification({ type: 'success', message: 'Clé API générée avec succès !' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la création.';
            setNotification({ type: 'error', message: errorMessage });
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteKey = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette clé ? Toute application l\'utilisant cessera de fonctionner.')) return;
        try {
            await developerApi.deleteKey(id);
            setKeys(keys.filter(k => k.id !== id));
            setNotification({ type: 'success', message: 'Clé supprimée.' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Impossible de supprimer la clé.' });
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setNotification({ type: 'success', message: 'Copié dans le presse-papier !' });
        setTimeout(() => setNotification(null), 2000);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">API Développeurs</h1>
                    <p className="text-slate-500 font-medium mt-1">Intégrez nos services directement dans vos applications.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold text-xs">
                    <Code size={16} />
                    Documentation: <Link to="/docs" className="text-brand-primary hover:underline ml-1">Consulter le guide API</Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Available Keys List */}
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        [1, 2].map(i => <div key={i} className="h-24 bg-white rounded-[24px] border border-slate-100 animate-pulse" />)
                    ) : keys.length > 0 ? (
                        keys.map(key => (
                            <motion.div
                                layout
                                key={key.id}
                                className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-brand-primary/20 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                                        <Key size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 text-base">{key.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="bg-slate-50 px-2 py-1 rounded-lg text-xs font-mono text-slate-500 border border-slate-100">
                                                {key.key ? (key.key.substring(0, 10) + '................' + key.key.substring(key.key.length - 5)) : '********************'}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(key.key)}
                                                className="text-slate-300 hover:text-brand-primary transition-colors"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 pl-16 sm:pl-0">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                        Dernière util.: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Jamais'}
                                    </span>
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-slate-200">
                            <Terminal size={48} className="mx-auto mb-4 text-slate-200" />
                            <h3 className="text-lg font-black text-slate-900 mb-1">Aucune clé API</h3>
                            <p className="text-slate-400 font-bold text-sm">Créez une clé pour commencer à utiliser l'API.</p>
                        </div>
                    )}
                </div>

                {/* Create Key Form */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                        <div className="relative z-10">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                                <Shield className="text-brand-primary" size={24} />
                                Nouvelle Clé
                            </h2>

                            <form onSubmit={handleCreateKey} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nom de l'application</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        placeholder="Ex: Mon Site WordPress"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-primary/50 transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!newKeyName.trim() || creating}
                                    className="w-full py-4 rounded-xl bg-white text-slate-900 font-black flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    {creating ? <div className="h-5 w-5 border-2 border-slate-900 rounded-full animate-spin border-t-transparent" /> : (
                                        <>
                                            Générer la Clé <Plus size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "mt-6 p-3 rounded-xl flex items-center gap-3 text-xs font-bold",
                                        notification.type === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"
                                    )}
                                >
                                    <CheckCircle2 size={16} />
                                    {notification.message}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
