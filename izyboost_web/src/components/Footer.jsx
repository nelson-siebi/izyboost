import { Link } from 'react-router-dom';

import {
    Facebook,
    Instagram,
    Smartphone,
    Send,
    Globe,
    Shield,
    Mail,
    ArrowRight,
    Youtube
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminApi } from '../features/admin/adminApi';
import apiClient from '../api/client';
import TutorialCTA from './TutorialCTA';

const TikTokIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.09-.26-.17-.39-.26-.41-.29-.81-.62-1.15-1 .1 1.78.07 3.56.07 5.33 0 2.45-.64 4.85-2.2 6.74-1.57 1.95-3.95 3.06-6.43 3.12-2.32.06-4.67-.6-6.52-2.02-1.85-1.43-2.99-3.62-2.95-5.94.03-2.4 1.25-4.66 3.25-5.98 1.83-1.2 4.13-1.6 6.27-1.11V7.12c-1.35-.45-2.88-.28-4.1.47-1.22.76-2.04 2.1-2.14 3.52-.11 1.54.55 3.08 1.69 4.11 1.14 1.03 2.76 1.48 4.28 1.23 1.52-.25 2.89-1.24 3.58-2.61.64-1.28.8-2.73.74-4.15V.02h.1z" />
    </svg>
);

const Footer = () => {
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await adminApi.getPublicSettings();
                const obj = {};
                data.forEach(s => obj[s.key] = s.value);
                setSettings(obj);
            } catch (err) {
                console.error("Footer: Failed to load settings", err);
            }
        };
        loadSettings();
    }, []);

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const socialLinks = [
        { icon: Facebook, href: settings.facebook_link, color: 'hover:text-blue-600' },
        { icon: TikTokIcon, href: settings.tiktok_link, color: 'hover:text-black' },
        { icon: Send, href: settings.telegram_link, color: 'hover:text-blue-400' },
        { icon: Youtube, href: settings.youtube_link, color: 'hover:text-red-600' },
    ];

    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10 mt-20 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 blur-[80px] -ml-32 -mb-32 rounded-full pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center">
                            {settings.site_logo ? (
                                <img
                                    src={resolveImgUrl(settings.site_logo)}
                                    alt="Logo"
                                    className="h-10 w-auto max-w-[180px] object-contain"
                                />
                            ) : (
                                <img
                                    src="/logo1.png"
                                    alt="Logo"
                                    className="h-10 w-auto max-w-[180px] object-contain"
                                />
                            )}
                        </Link>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                            {settings.site_description || 'Propulsez votre présence sur les réseaux sociaux avec les meilleurs services de boost du marché.'}
                        </p>
                        <div className="flex items-center gap-3">
                            {socialLinks.filter(s => s.href).map((link, i) => (
                                <a
                                    key={`footer-social-${i}`}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 bg-slate-50 rounded-lg text-slate-400 transition-all ${link.color} hover:bg-white hover:shadow-md`}
                                >
                                    <link.icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Plateforme</h4>
                        <ul className="space-y-4">
                            {[
                                { label: 'Tableau de bord', path: '/dashboard' },
                                { label: 'Assistance Client', path: '/dashboard/support' },
                                { label: 'Affiliation', path: '/dashboard/referrals' },
                                { label: 'Documentation API', path: '/dashboard/api-keys' },
                            ].map(item => (
                                <li key={item.path}>
                                    <Link to={item.path} className="text-slate-500 hover:text-brand-primary text-sm font-bold flex items-center gap-2 group">
                                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support & Tutorials */}
                    <div>
                        <TutorialCTA variant="footer" />
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Contact</h4>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4 group">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                    <p className="text-sm font-bold text-slate-900">{settings.site_email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                                    <Smartphone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</p>
                                    <p className="text-sm font-bold text-slate-900">{settings.whatsapp_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400">
                        © {new Date().getFullYear()} {settings.site_name || 'IZYBOOST'}. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="#" className="text-xs font-bold text-slate-400 hover:text-slate-900">CGV / CGU</Link>
                        <Link to="#" className="text-xs font-bold text-slate-400 hover:text-slate-900">Politique de confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
