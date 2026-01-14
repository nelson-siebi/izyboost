import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Zap } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../utils/cn';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import WhatsAppButton from '../components/WhatsAppButton';
import { adminApi } from '../features/admin/adminApi';
import apiClient from '../api/client';

export default function LandingLayout() {
    const { isAuthenticated } = useAuthStore();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [siteLogo, setSiteLogo] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide header on scroll down, show on scroll up
            if (currentScrollY > lastScrollY && currentScrollY > 120) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setIsScrolled(currentScrollY > 20);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Fetch site logo
    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const data = await adminApi.getPublicSettings();
                const logoSetting = data.find(s => s.key === 'site_logo');
                if (logoSetting?.value) setSiteLogo(logoSetting.value);
            } catch (err) {
                console.error("Failed to fetch logo", err);
            }
        };
        fetchLogo();
    }, []);

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    const navLinks = [
        { label: 'Accueil', path: '/' },
        { label: 'Services', path: '/auth/login' },
        { label: 'API Docs', path: '/docs' },
        { label: 'Contact', path: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-brand-primary/20 selection:text-brand-primary">
            {/* Nav Header */}
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 h-20 lg:h-24 flex items-center",
                    isScrolled
                        ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm"
                        : "bg-transparent",
                    !isVisible && "-translate-y-full"
                )}
            >
                <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center group relative z-10">
                        {siteLogo ? (
                            <img
                                src={resolveImgUrl(siteLogo)}
                                alt="Logo"
                                className="h-8 lg:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                        ) : (
                            <img
                                src="/logo1.png"
                                alt="Logo"
                                className="h-9 lg:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                        )}
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "text-sm font-black uppercase tracking-widest transition-all hover:text-brand-primary",
                                    location.pathname === link.path ? "text-brand-primary" : "text-slate-500"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="px-8 py-3 bg-brand-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all flex items-center gap-2 group"
                            >
                                Mon Dashboard <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/auth/login"
                                    className="px-6 py-2.5 text-sm font-black uppercase tracking-widest text-slate-900 hover:text-brand-primary transition-colors"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/auth/register"
                                    className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-brand-primary hover:shadow-brand-primary/20 transition-all flex items-center gap-2 group"
                                >
                                    S'inscrire <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </header>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[150] lg:hidden animate-[fade-in_0.2s_ease-out]"
                >
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div
                        className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white p-8 space-y-12 shadow-2xl animate-[slide-in-right_0.3s_ease-out]"
                    >
                        <div className="flex items-center justify-between">
                            {siteLogo ? (
                                <img
                                    src={resolveImgUrl(siteLogo)}
                                    alt="Logo"
                                    className="h-10 w-auto max-w-[150px] object-contain"
                                />
                            ) : (
                                <img
                                    src="/logo1.png"
                                    alt="Logo"
                                    className="h-10 w-auto max-w-[150px] object-contain"
                                />
                            )}
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "text-2xl font-black italic transition-colors",
                                        location.pathname === link.path ? "text-brand-primary" : "text-slate-900"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="space-y-4 pt-10 border-t border-slate-100">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl"
                                >
                                    Mon Dashboard <ArrowRight size={20} strokeWidth={3} />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/auth/register"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        Démarrer <ArrowRight size={20} strokeWidth={3} />
                                    </Link>
                                    <Link
                                        to="/auth/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full py-5 bg-slate-50 text-slate-900 rounded-2xl font-black text-lg flex items-center justify-center"
                                    >
                                        Déjà membre ?
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Content Container */}
            <main className="flex-1 pt-20 lg:pt-0 overflow-x-hidden">
                <ScrollToTop />
                <Outlet />
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    );
}
