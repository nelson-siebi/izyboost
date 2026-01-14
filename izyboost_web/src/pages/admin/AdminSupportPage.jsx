import React, { useState, useEffect } from 'react';
import { adminApi } from '../../features/admin/adminApi';
import {
    MessageSquare,
    Send,
    X,
    Loader2,
    Filter,
    CheckCircle,
    Clock,
    Search,
    User,
    Mail,
    AlertCircle
} from 'lucide-react';

import { cn } from '../../utils/cn';

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [message, setMessage] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'Tous les tickets' },
        { id: 'open', label: 'Ouverts' },
        { id: 'answered', label: 'Répondus' },
        { id: 'closed', label: 'Fermés' },
    ];

    useEffect(() => {
        loadTickets();
    }, [activeFilter]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const status = activeFilter === 'all' ? '' : activeFilter;
            const data = await adminApi.getTickets(1, status);
            const ticketsData = data.data || data || [];
            const finalTickets = Array.isArray(ticketsData) ? ticketsData : [];
            setTickets(finalTickets);
        } catch (error) {
            console.error('Failed to load tickets:', error);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const loadTicketDetails = async (ticket) => {
        setSelectedTicket(ticket);
        setLoadingDetails(true);
        try {
            const data = await adminApi.getTicket(ticket.uuid);
            setSelectedTicket(data);
        } catch (error) {
            console.error('Failed to load ticket details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedTicket) return;
        try {
            const newMsg = await adminApi.replyTicket(selectedTicket.uuid, message);

            // Optimistic/Local Update
            setSelectedTicket(prev => ({
                ...prev,
                messages: [...prev.messages, newMsg],
                status: 'answered'
            }));

            // Update list status without full reload
            setTickets(prev => prev.map(t =>
                t.id === selectedTicket.id
                    ? { ...t, status: 'answered', updated_at: new Date().toISOString() }
                    : t
            ));

            setMessage('');
        } catch (error) {
            alert('Erreur lors de l\'envoi');
        }
    };

    const handleClose = async () => {
        if (!selectedTicket) return;
        try {
            await adminApi.closeTicket(selectedTicket.uuid);
            setSelectedTicket(null);
            loadTickets();
        } catch (error) {
            alert('Erreur lors de la fermeture');
        }
    };

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Client</h1>
                    <p className="text-slate-500 font-medium">Gérez les demandes d'assistance</p>
                </div>
            </div>

            {/* Main Content Split View */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                {/* Tickets List */}
                <div className={cn(
                    "lg:col-span-4 bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden",
                    selectedTicket ? "hidden lg:flex" : "flex"
                )}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                                        activeFilter === filter.id
                                            ? "bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"></div>
                            ))
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => loadTicketDetails(ticket)}
                                    className={cn(
                                        "p-4 rounded-2xl cursor-pointer border transition-all hover:shadow-md group relative overflow-hidden",
                                        selectedTicket?.id === ticket.id
                                            ? "bg-blue-50 border-blue-200 shadow-sm"
                                            : "bg-white border-slate-100 hover:border-blue-100"
                                    )}
                                >
                                    {selectedTicket?.id === ticket.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                    )}
                                    <div className="flex justify-between items-start mb-2 pl-2">
                                        <h4 className={cn("font-bold text-sm truncate pr-2", selectedTicket?.id === ticket.id ? "text-blue-700" : "text-slate-800")}>
                                            {ticket.subject}
                                        </h4>
                                        <span className={cn(
                                            "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                                            ticket.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                                                ticket.status === 'answered' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-500'
                                        )}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-2 mb-2">
                                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                            {ticket.user?.username?.[0]?.toUpperCase()}
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{ticket.user?.username}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium pl-2">{new Date(ticket.created_at).toLocaleDateString()} à {new Date(ticket.created_at).toLocaleTimeString().slice(0, 5)}</p>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 text-sm font-bold">Aucun ticket trouvé</p>
                                <p className="text-slate-400 text-xs mt-1">Tout semble calme pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Conversation View */}
                <div className={cn(
                    "lg:col-span-8 bg-white rounded-[24px] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden",
                    !selectedTicket ? "hidden lg:flex" : "flex"
                )}>
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <Filter className="h-6 w-6 rotate-90" /> {/* Using Filter as a surrogate for ChevronLeft or Menu since I want a back feel, or I can import ArrowLeft if needed. Actually I'll use ChevronLeft if I import it or use a lucide icon already imported. */}
                                    </button>
                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 line-clamp-1">{selectedTicket.subject}</h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span className="font-bold text-slate-700">{selectedTicket.user?.username}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedTicket.user?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-bold transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Fermer le ticket
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                                {loadingDetails && !selectedTicket.messages && (
                                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                        <p className="text-slate-500 text-sm font-medium">Chargement de la conversation...</p>
                                    </div>
                                )}

                                {selectedTicket.messages?.map((msg) => {
                                    const isTicketOwner = String(msg.user_id) === String(selectedTicket.user_id);
                                    return (
                                        <div
                                            key={msg.id}
                                            className={cn(
                                                "flex w-full",
                                                isTicketOwner ? "justify-start" : "justify-end"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[80%] rounded-[20px] p-5 shadow-sm relative group transition-all",
                                                isTicketOwner
                                                    ? "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                                                    : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm shadow-blue-500/20"
                                            )}>
                                                <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                                                <p className={cn(
                                                    "text-[10px] mt-2 font-bold opacity-70",
                                                    isTicketOwner ? "text-slate-400" : "text-blue-100"
                                                )}>{new Date(msg.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {selectedTicket.status === 'closed' && (
                                    <div className="flex justify-center py-4">
                                        <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                                            Ticket fermé
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Reply Box */}
                            <form onSubmit={handleReply} className="p-4 bg-white border-t border-slate-100">
                                <div className="relative flex gap-3 items-end">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Écrivez votre réponse..."
                                        rows={1}
                                        disabled={selectedTicket.status === 'closed'}
                                        className="flex-1 w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-[20px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none min-h-[50px] max-h-32"
                                        onInput={(e) => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || loadingDetails || selectedTicket.status === 'closed'}
                                        className="absolute right-2 bottom-1.5 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-12 bg-slate-50/30">
                            <div className="text-center max-w-md p-8">
                                <div className="h-24 w-24 bg-white rounded-full shadow-lg shadow-slate-200/50 flex items-center justify-center mx-auto mb-6 transform rotate-12">
                                    <MessageSquare className="h-10 w-10 text-blue-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-3">Sélectionnez une conversation</h3>
                                <p className="text-slate-500 font-medium">Choisissez un ticket dans la liste pour afficher les détails du problème et répondre à l'utilisateur.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
