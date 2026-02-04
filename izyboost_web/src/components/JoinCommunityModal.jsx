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
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const hasSeenModal = localStorage.getItem('hasSeenCommunityModal');

        if (!hasSeenModal) {
            const loadSocialLinks = async () => {
                try {
                    const data = await adminApi.getPublicSettings();
                    const links = [];

                    // Config mapping for cleaner code
                    const mappings = [
                        { key: 'facebook_link', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]', text: 'text-white' },
                        { key: 'telegram_link', name: 'Telegram', icon: Send, color: 'bg-[#0088cc]', text: 'text-white' },
                        { key: 'tiktok_link', name: 'TikTok', icon: TikTokIcon, color: 'bg-black', text: 'text-white' },
                        { key: 'whatsapp_number', name: 'WhatsApp', icon: Users, color: 'bg-[#25D366]', text: 'text-white', isPhone: true },
                        { key: 'youtube_link', name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]', text: 'text-white' },
                    ];

                    mappings.forEach(map => {
                        const setting = data.find(s => s.key === map.key);
                        if (setting?.value) {
                            links.push({
                                ...map,
                                url: map.isPhone ? `https://wa.me/${setting.value.replace(/[^0-9]/g, '')}` : setting.value
                            });
                        }
                    });

                    if (links.length > 0) {
                        setSocialLinks(links);
                        setTimeout(() => {
                            setIsOpen(true);
                            setIsAnimating(true);
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to load social links:', err);
                }
            };
            loadSocialLinks();
        }
    }, []);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            setIsOpen(false);
            localStorage.setItem('hasSeenCommunityModal', 'true');
        }, 300); // Wait for exit animation
    };

    const handleJoin = (url) => {
        window.open(url, '_blank');
        handleClose();
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
                isAnimating ? "bg-slate-900/60 backdrop-blur-md opacity-100" : "bg-slate-900/0 backdrop-blur-none opacity-0"
            )}
            onClick={handleClose}
        >
            <div
                className={cn(
                    "relative w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 transform",
                    isAnimating ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-95 opacity-0"
                )}
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-transparent" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-20 -left-10 w-32 h-32 bg-brand-secondary/10 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative px-8 pt-12 pb-8">
                    {/* Icon Header */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-2xl rotate-3 shadow-lg shadow-brand-primary/20 flex items-center justify-center">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center space-y-3 mb-8">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                            Rejoignez la Communauté !
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Ne ratez plus aucune astuce, promo ou nouveauté. Connectez-vous avec nous !
                        </p>
                    </div>

                    {/* Social Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {socialLinks.map((social) => (
                            <button
                                key={social.name}
                                onClick={() => handleJoin(social.url)}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group hover:shadow-lg active:scale-95",
                                    "bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600",
                                    "hover:border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                    social.color,
                                    social.text
                                )}>
                                    <social.icon size={20} />
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-primary transition-colors">
                                    {social.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="text-center">
                        <button
                            onClick={handleClose}
                            className="text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2"
                        >
                            Non merci, je verrai plus tard
                        </button>
                    </div>
                </div>

                {/* Close Button Absolute */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default JoinCommunityModal;
