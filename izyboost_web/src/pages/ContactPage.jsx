import React, { useState, useEffect } from 'react';
import { Mail, Smartphone, Send, MapPin, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';
import { cn } from '../utils/cn';
import { adminApi } from '../features/admin/adminApi';
import apiClient from '../api/client';

export default function ContactPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await adminApi.getPublicSettings();
                const obj = {};
                data.forEach(s => obj[s.key] = s.value);
                setSettings(obj);
            } catch (err) {
                console.error("Failed to load settings", err);
            }
        };
        loadSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiClient.post('/contact', formData);

            setSent(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Contactez-nous"
                description="Notre équipe est à votre écoute. Contactez notre support pour toute question sur nos services de boost ou votre compte."
            />

            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none" />

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                            <Send size={14} /> ON VOUS ÉCOUTE
                        </div>

                        <h1
                            className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight"
                        >
                            Parlons de votre <span className="text-brand-primary italic">croissance</span>.
                        </h1>

                        <p
                            className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed"
                        >
                            Une question technique ? Un besoin de partenariat ? Ou simplement envie de dire bonjour ? Notre équipe vous répond en moins de 24h.
                        </p>

                        <div className="space-y-6 pt-4">
                            {[
                                { icon: Mail, label: 'Email', value: settings.site_email || 'contact@votre-domaine.com', color: 'bg-blue-50 text-blue-600' },
                                { icon: Smartphone, label: 'WhatsApp', value: settings.whatsapp_number || '+237 695 345 715', color: 'bg-emerald-50 text-emerald-600' },
                                { icon: MapPin, label: 'Localisation', value: 'Douala, Cameroun (Service Mondial)', color: 'bg-indigo-50 text-indigo-600' },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-6 group cursor-pointer"
                                    onClick={() => item.label === 'Email' ? window.location.href = `mailto:${item.value}` : null}
                                >
                                    <div className={cn("h-14 w-14 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                                        <p className="text-lg font-black text-slate-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-2xl relative"
                    >
                        {!sent ? (
                            <form
                                key="form"
                                onSubmit={handleSubmit}
                                className="space-y-6 animate-[fade-in_0.5s_ease-out]"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Nom complet</label>
                                        <input
                                            required
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            type="text"
                                            placeholder="Entrez votre nom complet"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-brand-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400 ml-1">Email</label>
                                        <input
                                            required
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            type="email"
                                            placeholder="votre@email.com"
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-brand-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Sujet</label>
                                    <input
                                        required
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="Objet de votre message"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-brand-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400 ml-1">Votre message</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-brand-primary/20 focus:bg-white outline-none transition-all font-bold text-slate-900 resize-none"
                                    />
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-primary transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Envoyer le message"}
                                    {!loading && <ChevronRight size={20} strokeWidth={3} />}
                                </button>
                            </form>
                        ) : (
                            <div
                                key="success"
                                className="text-center py-12 space-y-6 animate-[fade-in_0.5s_ease-out]"
                            >
                                <div className="h-24 w-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto scale-110">
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black text-slate-900">Message envoyé !</h3>
                                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Merci de nous avoir contacté. Nous reviendrons vers vous très rapidement.</p>
                                </div>
                                <button
                                    onClick={() => setSent(false)}
                                    className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl font-black text-sm hover:bg-slate-200 transition-all"
                                >
                                    Envoyer un autre message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
