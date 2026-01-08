import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../features/admin/adminApi';
import {
    Users,
    ShoppingCart,
    CreditCard,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { cn } from '../../utils/cn';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        console.log("AdminDashboard Loaded v2.0 - Bento Grid Active");
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsData, revenueRes] = await Promise.all([
                adminApi.getDashboardStats(),
                adminApi.getRevenueStats()
            ]);

            setStats({
                total_revenue: statsData?.finance?.total_revenue || 0,
                total_orders: statsData?.orders?.total || 0,
                total_users: statsData?.users?.total || 0,
                open_tickets: statsData?.support?.open_tickets || 0
            });
            setRevenueData(revenueRes || []);

            // Format recent orders from statsData
            if (statsData?.recent_orders) {
                const formattedOrders = statsData.recent_orders.map(order => ({
                    id: order.id,
                    user: order.user?.username || 'Client',
                    amount: order.sell_price || 0,
                    status: order.status,
                    date: new Date(order.created_at).toLocaleDateString()
                }));
                setRecentOrders(formattedOrders);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            setStats({ total_revenue: 0, total_orders: 0, total_users: 0 });
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
        <motion.div
            variants={item}
            className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all"
        >
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110", color)} />

            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white transition-colors", `group-hover:${color.replace('bg-', 'bg-')}`)}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend !== undefined && (
                    <div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600")}>
                        {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <h3 className="text-slate-500 text-sm font-bold mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
                {subValue && <span className="text-sm font-medium text-slate-400">{subValue}</span>}
            </div>
        </motion.div>
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
    );

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-7xl mx-auto"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h1>
                    <p className="text-slate-500 font-medium">Bienvenue sur votre nouveau tableau de bord.</p>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['24h', '7d', '30d', '12m'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                                timeRange === range
                                    ? "bg-slate-900 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Revenu Total"
                    value={`${(stats?.total_revenue || 0).toLocaleString()} F`}
                    icon={DollarSign}
                    trend={12.5}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Commandes"
                    value={stats?.total_orders || 0}
                    subValue="+24 adj."
                    icon={ShoppingCart}
                    trend={8.2}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Utilisateurs"
                    value={stats?.total_users || 0}
                    icon={Users}
                    trend={-2.4}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Tickets Actifs"
                    value={stats?.open_tickets || 0}
                    icon={Activity}
                    trend={0}
                    color="bg-purple-500"
                />
            </div>

            {/* Main Content Grid (Bento Style) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Revenue Chart (Big Block) */}
                <motion.div variants={item} className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Analyse des Revenus</h3>
                            <p className="text-sm font-medium text-slate-400">Croissance mensuelle</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                <TrendingUp className="h-4 w-4" />
                                +14.5%
                            </span>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData.length ? revenueData : Array(7).fill(0).map((_, i) => ({ date: `Day ${i + 1}`, revenue: Math.random() * 100000 }))}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Right Column Stack */}
                <div className="space-y-8 flex flex-col">

                    {/* Recent Orders Widget */}
                    <motion.div variants={item} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900">Commandes Récentes</h3>
                            <button className="text-sm font-bold text-orange-500 hover:text-orange-600">Voir tout</button>
                        </div>
                        <div className="space-y-4">
                            {recentOrders.map((order, idx) => (
                                <div key={order.id || idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                                            order.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                                                order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                                                    "bg-red-100 text-red-600"
                                        )}>
                                            <Package className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{order.user}</p>
                                            <p className="text-xs text-slate-400 font-medium">{order.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">{typeof order.amount === 'number' ? order.amount.toLocaleString() : order.amount} F</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Action Widget */}
                    <motion.div variants={item} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black mb-1">Actions Rapides</h3>
                            <p className="text-slate-400 text-xs font-medium mb-6">Gérez votre plateforme efficacement</p>

                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    to="/admin/users"
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-left transition-all group block"
                                >
                                    <Users className="h-5 w-5 mb-2 text-orange-400 group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-bold">Ajouter Admin</p>
                                </Link>
                                <Link
                                    to="/admin/finance"
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-left transition-all group block"
                                >
                                    <CreditCard className="h-5 w-5 mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <p className="text-xs font-bold">Virement</p>
                                </Link>
                            </div>
                        </div>
                        {/* Decorative background blob */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500 rounded-full blur-[60px] opacity-20 pointer-events-none" />
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
