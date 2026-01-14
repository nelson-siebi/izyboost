import { MessageCircle } from 'lucide-react';

import { useEffect, useState } from 'react';
import { adminApi } from '../features/admin/adminApi';

const WhatsAppButton = () => {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const loadWhatsapp = async () => {
            console.log("WhatsAppButton: Loading settings...");
            try {
                const settings = await adminApi.getPublicSettings();
                console.log("WhatsAppButton: Raw settings:", settings);

                let whatsapp = '';
                if (Array.isArray(settings)) {
                    whatsapp = settings.find(s => s.key === 'whatsapp_number')?.value;
                } else if (settings && typeof settings === 'object') {
                    whatsapp = settings.whatsapp_number;
                }

                if (whatsapp) {
                    const cleanNum = whatsapp.replace(/\s+/g, '').replace('+', '');
                    setWhatsappNumber(`https://wa.me/${cleanNum}`);
                } else {
                    // Use a sensible default if not set
                    setWhatsappNumber("https://wa.me/237695345715");
                }
            } catch (err) {
                console.error("WhatsAppButton: Failed to load WhatsApp number:", err);
                setWhatsappNumber("https://wa.me/237695345715");
            }
        };
        loadWhatsapp();

        // Show almost immediately
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    if (!whatsappNumber) return null;

    return (
        isVisible && (
            <a
                href={whatsappNumber}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-24 lg:bottom-10 right-6 z-[100] group transition-all duration-300 hover:-translate-y-1 hover:scale-110 active:scale-90 animate-[fade-in-up_0.3s_ease-out]"
            >
                {/* Tooltip */}
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <p className="text-sm font-black text-slate-800">Support WhatsApp</p>
                </div>

                {/* Button */}
                <div className="h-14 w-14 lg:h-16 lg:w-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-500/40 relative">
                    <MessageCircle size={32} className="fill-white/20" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-white/20 border-2 border-green-500"></span>
                    </span>
                </div>
            </a>
        )
    );
};

export default WhatsAppButton;
