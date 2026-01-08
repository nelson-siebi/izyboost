import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function StatCard({ label, value, icon: Icon, trend, colorClass = "bg-white" }) {
    const isDark = colorClass.includes('bg-black') || colorClass.includes('bg-brand-primary');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-8 rounded-[32px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start justify-between relative overflow-hidden group ${colorClass}`}
        >
            <div className="relative z-10">
                <p className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mb-3",
                    isDark ? "text-white/50" : "text-slate-400"
                )}>{label}</p>
                <h3 className={cn(
                    "text-3xl font-black tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                )}>{value}</h3>
                {trend && (
                    <div className={cn(
                        "mt-4 text-[10px] font-black flex items-center uppercase tracking-widest",
                        trend > 0 ? (isDark ? 'text-white/80' : 'text-emerald-500') : 'text-slate-400'
                    )}>
                        <span className={cn(
                            "px-2 py-0.5 rounded-lg mr-2",
                            isDark ? "bg-white/10" : "bg-emerald-50"
                        )}>
                            {trend > 0 ? `+${trend}%` : `${trend}%`}
                        </span>
                        <span>Performance</span>
                    </div>
                )}
            </div>

            <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10 transition-transform duration-500 group-hover:rotate-12",
                isDark ? "bg-white/10 text-white" : "bg-slate-50 text-brand-primary"
            )}>
                <Icon size={28} />
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl" />
        </motion.div>
    );
}
