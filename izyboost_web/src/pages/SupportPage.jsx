import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, Clock, CheckCircle2, AlertCircle, Send, ChevronRight, User, Shield } from 'lucide-react';
import { supportApi } from '../features/common/supportApi';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/useAuthStore';

export default function SupportPage() {
    const { user } = useAuthStore();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [creating, setCreating] = useState(false);

    // New Ticket Form
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [priority, setPriority] = useState('low');
    const [department, setDepartment] = useState('support');

    // Reply Form
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await supportApi.getTickets();
            setTickets(data.data || data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await supportApi.createTicket({ subject, message, priority, department });
            setSubject('');
            setMessage('');
            setCreating(false);
            loadTickets(); // Refresh list
        } catch (error) {
            alert('Erreur lors de la création du ticket');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setSendingReply(true);
        try {
            await supportApi.replyTicket(selectedTicket.uuid, replyMessage);
            setReplyMessage('');
            // Refresh current ticket messages details - implementation depends on if getTicket returns messages
            // For now, we mock the update or reload user request if needed
            // Ideally we fetch the single ticket details again
            const updatedTicket = await supportApi.getTicket(selectedTicket.uuid);
            setSelectedTicket(updatedTicket.data || updatedTicket);

        } catch (error) {
            console.error(error);
        } finally {
            setSendingReply(false);
        }
    };

    const openTicket = async (ticket) => {
        // Fetch full details including messages if not present in list
        try {
            const fullTicket = await supportApi.getTicket(ticket.uuid);
            setSelectedTicket(fullTicket.data || fullTicket);
        } catch (e) {
            console.error(e);
            setSelectedTicket(ticket); // Fallback
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto flex flex-col md:flex-row gap-6 pb-6">

            {/* Left Panel: Ticket List */}
            <div className={cn(
                "w-full md:w-1/3 flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden",
                selectedTicket ? "hidden md:flex" : "flex"
            )}>
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-black text-slate-900">Tickets</h2>
                    <button
                        onClick={() => setCreating(true)}
                        className="h-10 w-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
                    >
                        <MessageCircle size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence>
                        {creating && (
                            <motion.div
                                key="create-ticket-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 overflow-hidden"
                            >
                                <form onSubmit={handleCreateTicket} className="space-y-3">
                                    <div className="flex gap-2">
                                        <select
                                            value={department}
                                            onChange={e => setDepartment(e.target.value)}
                                            className="bg-white px-3 py-2 rounded-xl text-xs font-bold border-none focus:ring-2 focus:ring-brand-primary/20"
                                        >
                                            <option value="support">Support</option>
                                            <option value="billing">Facturation</option>
                                            <option value="technical">Technique</option>
                                            <option value="sales">Commercial</option>
                                            <option value="abuse">Abus</option>
                                        </select>
                                        <input
                                            autoFocus
                                            placeholder="Sujet"
                                            className="flex-1 bg-white px-3 py-2 rounded-xl text-sm font-bold border-none focus:ring-2 focus:ring-brand-primary/20"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Message..."
                                        className="w-full bg-white px-3 py-2 rounded-xl text-sm font-medium border-none focus:ring-2 focus:ring-brand-primary/20 resize-none h-24"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setCreating(false)} className="text-xs font-bold text-slate-400 px-3 py-2">Annuler</button>
                                        <button type="submit" className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg">Envoyer</button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading ? (
                        Array(3).fill(0).map((_, i) => <div key={`skeleton-ticket-${i}`} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
                    ) : tickets.length > 0 ? (
                        tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => openTicket(ticket)}
                                className={cn(
                                    "p-4 rounded-2xl cursor-pointer transition-all border",
                                    selectedTicket?.id === ticket.id
                                        ? "bg-brand-primary/5 border-brand-primary/20"
                                        : "bg-white border-transparent hover:bg-slate-50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={cn("font-bold text-sm line-clamp-1", selectedTicket?.id === ticket.id ? "text-brand-primary" : "text-slate-900")}>
                                        {ticket.subject}
                                    </h4>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                        ticket.status === 'open' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                                    )}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium line-clamp-2">
                                    {ticket.last_message || "Aucun message"}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400">
                            <p className="text-sm font-bold">Aucun ticket.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Conversation */}
            <div className={cn(
                "w-full md:w-2/3 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col overflow-hidden relative",
                !selectedTicket ? "hidden md:flex justify-center items-center" : "flex"
            )}>
                {!selectedTicket ? (
                    <div className="text-center p-8 opacity-50">
                        <MessageCircle size={64} className="mx-auto mb-4 stroke-1 text-slate-300" />
                        <p className="text-slate-400 font-bold">Sélectionnez un ticket pour voir la conversation.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                            <button onClick={() => setSelectedTicket(null)} className="md:hidden p-2 -ml-2 text-slate-400">
                                <ChevronRight className="rotate-180" />
                            </button>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">{selectedTicket.subject}</h3>
                                <p className="text-xs font-bold text-slate-400">Ticket #{selectedTicket.uuid?.substring(0, 8)}</p>
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                            {/* Conversation Loop */}
                            {selectedTicket.messages?.map((msg) => {
                                const isMe = String(msg.user_id) === String(user?.id);
                                return (
                                    <div key={msg.id} className={cn("flex gap-4", isMe ? "flex-row-reverse" : "")}>
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                            isMe ? "bg-slate-200" : "bg-brand-primary text-white"
                                        )}>
                                            {isMe ? <User key="user-icon" size={18} className="text-slate-500" /> : <Shield key="shield-icon" size={18} />}
                                        </div>
                                        <div className={cn("space-y-1 max-w-[80%]", isMe ? "text-right" : "")}>
                                            <div className={cn("flex items-baseline gap-2", isMe ? "justify-end flex-row-reverse" : "")}>
                                                <span className="text-xs font-black text-slate-900">{isMe ? 'Vous' : 'Soutien'}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
                                            </div>
                                            <div className={cn(
                                                "p-4 rounded-2xl border shadow-sm text-sm font-medium leading-relaxed text-left",
                                                isMe
                                                    ? "bg-white border-slate-200 text-slate-700 rounded-tr-sm"
                                                    : "bg-brand-primary text-white border-brand-primary rounded-tl-sm"
                                            )}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <form onSubmit={handleReply} className="flex gap-2">
                                <input
                                    type="text"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Écrivez votre message..."
                                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-primary/20"
                                />
                                <button
                                    type="submit"
                                    disabled={!replyMessage.trim() || sendingReply}
                                    className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-colors"
                                >
                                    {sendingReply ? <div key="sending-spinner" className="h-4 w-4 border-2 border-white rounded-full animate-spin border-t-transparent" /> : <Send key="send-icon" size={20} />}
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
