import { useState, useEffect } from 'react';

import { X, Facebook, Send, Users, Youtube } from 'lucide-react';
import { adminApi } from '../features/admin/adminApi';
import { cn } from '../utils/cn';

const TikTokIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.09-.26-.17-.39-.26-.41-.29-.81-.62-1.15-1 .1 1.78.07 3.56.07 5.33 0 2.45-.64 4.85-2.2 6.74-1.57 1.95-3.95 3.06-6.43 3.12-2.32.06-4.67-.6-6.52-2.02-1.85-1.43-2.99-3.62-2.95-5.94.03-2.4 1.25-4.66 3.25-5.98 1.83-1.2 4.13-1.6 6.27-1.11V7.12c-1.35-.45-2.88-.28-4.1.47-1.22.76-2.04 2.1-2.14 3.52-.11 1.54.55 3.08 1.69 4.11 1.14 1.03 2.76 1.48 4.28 1.23 1.52-.25 2.89-1.24 3.58-2.61.64-1.28.8-2.73.74-4.15V.02h.1z" />
    </svg>
);

const JoinCommunityModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState([]);

    useEffect(() => {
        // Check if modal has been shown before
        const hasSeenModal = localStorage.getItem('hasSeenCommunityModal');

        if (!hasSeenModal) {
            // Fetch social links from settings
            const loadSocialLinks = async () => {
                try {
                    const data = await adminApi.getPublicSettings();
                    const links = [];

                    const facebookLink = data.find(s => s.key === 'facebook_link')?.value;
                    const telegramLink = data.find(s => s.key === 'telegram_link')?.value;
                    const tiktokLink = data.find(s => s.key === 'tiktok_link')?.value;
                    const whatsappLink = data.find(s => s.key === 'whatsapp_number')?.value;
                    const youtubeLink = data.find(s => s.key === 'youtube_link')?.value;

                    if (facebookLink) {
                        links.push({
                            name: 'Facebook',
                            icon: Facebook,
                            url: facebookLink,
                            color: 'from-blue-500 to-blue-600',
                            hoverColor: 'hover:shadow-blue-500/50'
                        });
                    }

                    if (telegramLink) {
                        links.push({
                            name: 'Telegram',
                            icon: Send,
                            url: telegramLink,
                            color: 'from-sky-400 to-sky-500',
                            hoverColor: 'hover:shadow-sky-400/50'
                        });
                    }

                    if (tiktokLink) {
                        links.push({
                            name: 'TikTok',
                            icon: TikTokIcon,
                            url: tiktokLink,
                            color: 'from-slate-800 to-black',
                            hoverColor: 'hover:shadow-slate-800/50'
                        });
                    }

                    if (whatsappLink) {
                        links.push({
                            name: 'WhatsApp',
                            icon: Users,
                            url: `https://wa.me/${whatsappLink.replace(/[^0-9]/g, '')}`,
                            color: 'from-emerald-500 to-emerald-600',
                            hoverColor: 'hover:shadow-emerald-500/50'
                        });
                    }

                    if (youtubeLink) {
                        links.push({
                            name: 'YouTube',
                            icon: Youtube,
                            url: youtubeLink,
                            color: 'from-rose-500 to-rose-600',
                            hoverColor: 'hover:shadow-rose-500/50'
                        });
                    }

                    if (links.length > 0) {
                        setSocialLinks(links);
                        // Show modal after 2 seconds
                        setTimeout(() => setIsOpen(true), 2000);
                    }
                } catch (err) {
                    console.error('Failed to load social links:', err);
                }
            };

            loadSocialLinks();
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('hasSeenCommunityModal', 'true');
    };

    const handleJoin = (url) => {
        window.open(url, '_blank');
        handleClose();
    };

    if (socialLinks.length === 0) return null;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
                    onClick={handleClose}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden animate-[zoom-in_0.3s_ease-out]"
                    >
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative z-10 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-3">
                                <div
                                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-lg shadow-brand-primary/20 animate-[bounce-in_0.5s_ease-out]"
                                >
                                    <Users size={32} className="text-white" />
                                </div>

                                <h2
                                    className="text-3xl font-black text-slate-900 animate-[fade-in-up_0.3s_ease-out_0.1s_both]"
                                >
                                    Rejoignez notre communauté !
                                </h2>

                                <p
                                    className="text-slate-500 font-medium max-w-sm mx-auto animate-[fade-in-up_0.3s_ease-out_0.2s_both]"
                                >
                                    Restez connecté avec nous pour recevoir des offres exclusives, des astuces et du support prioritaire.
                                </p>
                            </div>

                            {/* Social links */}
                            <div className={cn(
                                "grid gap-4 pt-4",
                                socialLinks.length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"
                            )}>
                                {socialLinks.map((social, index) => (
                                    <button
                                        key={social.name}
                                        onClick={() => handleJoin(social.url)}
                                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                                        className={`group relative p-6 bg-gradient-to-br ${social.color} rounded-2xl shadow-lg ${social.hoverColor} hover:shadow-2xl transition-all duration-300 active:scale-95 animate-[fade-in-up_0.3s_ease-out_both]`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <social.icon size={32} className="text-white" />
                                            <span className="text-white font-black text-sm">{social.name}</span>
                                        </div>

                                        {/* Shine effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                                    </button>
                                ))}
                            </div>

                            {/* Skip button */}
                            <button
                                onClick={handleClose}
                                className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors animate-[fade-in_0.3s_ease-out_0.6s_both]"
                            >
                                Peut-être plus tard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default JoinCommunityModal;
