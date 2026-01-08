import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, X, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { notificationsApi } from './notificationsApi';
import { cn } from '../../utils/cn';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Poll for unread count every 60 seconds
    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchCount = async () => {
        try {
            const data = await notificationsApi.getUnreadCount();
            setUnreadCount(data.count || 0); // Adapt based on actual response structure
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationsApi.getAll();
            setNotifications(data.data || data);
            // Optionally update count here too
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleDropdown = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date() })));
            setUnreadCount(0);
        } catch (error) {
            console.error(error);
        }
    };

    const getIcon = (type) => {
        // Map notification types to icons if available in your data
        if (type?.includes('error')) return <AlertCircle size={20} className="text-red-500" />;
        if (type?.includes('success')) return <CheckCircle2 size={20} className="text-emerald-500" />;
        return <Info size={20} className="text-brand-primary" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 backdrop-blur-xl">
                            <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                            {notifications.some(n => !n.read_at) && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[10px] font-bold text-brand-primary hover:text-brand-secondary uppercase tracking-wider"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            ) : notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "p-4 flex gap-3 transition-colors hover:bg-slate-50",
                                                !notif.read_at ? "bg-brand-primary/[0.02]" : "bg-white"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                !notif.read_at ? "bg-brand-primary/10" : "bg-slate-100"
                                            )}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-sm text-slate-900 leading-snug mb-1", !notif.read_at ? "font-bold" : "font-medium")}>
                                                    {notif.data?.message || notif.data?.title || 'Nouvelle notification'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400">
                                                    {new Date(notif.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notif.read_at && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id)}
                                                    className="h-8 w-8 rounded-full hover:bg-brand-primary/10 text-brand-primary flex items-center justify-center transition-colors"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-6 text-center">
                                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Bell size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm">Aucune notification pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
