import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, History, ArrowUpRight, ArrowDownLeft, Search, Filter, Plus, Smartphone, Globe, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { walletApi } from '../features/wallet/walletApi';
import { cn } from '../utils/cn';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositMethods, setDepositMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', message: '' }

    const [pollingRef, setPollingRef] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

    useEffect(() => {
        loadData();
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, []);

    const startPolling = (reference) => {
        if (pollingInterval) clearInterval(pollingInterval);
        setPollingRef(reference);

        const interval = setInterval(async () => {
            try {
                const statusData = await walletApi.checkStatus(reference);
                if (statusData.status === 'completed') {
                    clearInterval(interval);
                    setPollingInterval(null);
                    setPollingRef(null);
                    setNotification({ type: 'success', message: 'Félicitations ! Votre compte a été crédité.' });
                    loadData(); // Update balance and history
                } else if (statusData.status === 'failed') {
                    clearInterval(interval);
                    setPollingInterval(null);
                    setPollingRef(null);
                    setNotification({ type: 'error', message: 'Le paiement a échoué ou a été annulé.' });
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        }, 3000); // Check every 3 seconds

        setPollingInterval(interval);
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [walletData, methodsData, txData] = await Promise.all([
                walletApi.getWallet(),
                walletApi.getDepositMethods(),
                walletApi.getTransactions()
            ]);

            setBalance(walletData.balance);
            setDepositMethods(methodsData); // Assuming simple array or object
            setTransactions(txData.data || txData); // Handle pagination structure
        } catch (error) {
            console.error('Failed to load wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!selectedMethod || !amount) return;

        // Mobile money check
        const isMobileMoney = ['orange_money', 'mtn_money'].includes(selectedMethod.code) || selectedMethod.type === 'mobile_money';

        if (isMobileMoney && !phoneNumber) {
            setNotification({ type: 'error', message: 'Veuillez entrer votre numéro de téléphone.' });
            return;
        }

        setProcessing(true);
        setNotification(null);

        try {
            const response = await walletApi.deposit({
                payment_method_id: selectedMethod.id,
                amount: parseFloat(amount),
                phone: phoneNumber
            });

            // If redirect URL provided (Global/Card)
            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                setNotification({ type: 'success', message: 'Demande envoyée ! Veuillez valider sur votre mobile.' });
                setAmount('');
                setPhoneNumber('');

                // Start polling automatically if we have a reference
                if (response.reference) {
                    startPolling(response.reference);
                }

                loadData(); // Initial refresh
            }
        } catch (error) {
            setNotification({ type: 'error', message: error.response?.data?.message || 'Une erreur est survenue lors du dépôt.' });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'pending': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'failed': return 'text-red-500 bg-red-50 border-red-100';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Succès';
            case 'pending': return 'En attente';
            case 'failed': return 'Échoué';
            default: return status;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mon Portefeuille</h1>
                    <p className="text-slate-500 font-medium mt-1">Gérez vos fonds et transactions en toute sécurité.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solde Dispo.</p>
                        <p className="text-xl font-black text-slate-900">{balance.toLocaleString()} FCFA</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deposit Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0" />

                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <Plus size={24} className="text-brand-primary" />
                                Recharger mon compte
                            </h2>

                            {notification && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "mb-6 p-4 rounded-2xl flex items-center gap-3 border",
                                        notification.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                                    )}
                                >
                                    {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <span className="font-bold text-sm">{notification.message}</span>
                                    <button onClick={() => setNotification(null)} className="ml-auto hover:opacity-70"><Plus size={16} className="rotate-45" /></button>
                                </motion.div>
                            )}

                            <form onSubmit={handleDeposit} className="space-y-8">
                                <AnimatePresence mode="wait">
                                    {pollingRef ? (
                                        <motion.div
                                            key="polling-state"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                                        >
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-full border-4 border-brand-primary/10 border-t-brand-primary animate-spin" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Smartphone size={32} className="text-brand-primary animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-black text-slate-900">Confirmation sur mobile</h3>
                                                <p className="text-slate-500 font-medium max-w-[280px] mx-auto">
                                                    Veuillez valider la transaction sur votre téléphone pour finaliser la recharge.
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-3 w-full max-w-[240px]">
                                                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réf</span>
                                                    <span className="text-xs font-mono font-bold text-slate-900">{pollingRef}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (pollingInterval) clearInterval(pollingInterval);
                                                        setPollingRef(null);
                                                        setPollingInterval(null);
                                                    }}
                                                    className="text-xs font-black text-red-500 hover:text-red-600 transition-colors py-2"
                                                >
                                                    Annuler la vérification
                                                </button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form-state"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-8"
                                        >
                                            {/* Methods Grid - Grouped */}
                                            <div className="space-y-6">
                                                {/* Helper to group methods */}
                                                {(() => {
                                                    const groups = {
                                                        cameroun: { label: 'Cameroun 🇨🇲', methods: [] },
                                                        global: { label: 'Tout Pays 🌍', methods: [] },
                                                        crypto: { label: 'Crypto & Autres', methods: [] }
                                                    };

                                                    depositMethods.forEach(method => {
                                                        if (['orange_money', 'mtn_money', 'orange', 'mtn'].includes(method.code)) {
                                                            groups.cameroun.methods.push(method);
                                                        } else if (['global', 'card', 'paypal', 'global_card', 'global_paypal'].includes(method.code) || ['card', 'paypal'].includes(method.type)) {
                                                            groups.global.methods.push(method);
                                                        } else {
                                                            groups.crypto.methods.push(method);
                                                        }
                                                    });

                                                    return Object.entries(groups).map(([key, group]) => (
                                                        group.methods.length > 0 && (
                                                            <div key={key} className="space-y-3">
                                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">{group.label}</label>
                                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {group.methods.map(method => (
                                                                        <div
                                                                            key={method.id}
                                                                            onClick={() => setSelectedMethod(method)}
                                                                            className={cn(
                                                                                "cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group",
                                                                                selectedMethod?.id === method.id
                                                                                    ? "border-brand-primary bg-brand-primary/[0.03] shadow-lg shadow-brand-primary/5"
                                                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                                                                            )}
                                                                        >
                                                                            {selectedMethod?.id === method.id && (
                                                                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-primary shadow-sm" />
                                                                            )}
                                                                            <div className={cn(
                                                                                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors overflow-hidden",
                                                                                selectedMethod?.id === method.id ? "bg-white" : "bg-slate-50"
                                                                            )}>
                                                                                {method.logo ? (
                                                                                    <img
                                                                                        src={method.logo}
                                                                                        alt={method.name}
                                                                                        className="h-full w-full object-contain p-1"
                                                                                    />
                                                                                ) : (
                                                                                    method.type === 'crypto' ? <Globe size={24} /> : <Smartphone size={24} />
                                                                                )}
                                                                            </div>
                                                                            <span className={cn(
                                                                                "font-black text-xs text-center",
                                                                                selectedMethod?.id === method.id ? "text-slate-900" : "text-slate-500"
                                                                            )}>{method.name}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )
                                                    ));
                                                })()}

                                                {loading && (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Phone Number Input - Only for Mobile Money */}
                                            {selectedMethod && selectedMethod.type === 'mobile_money' && (
                                                <div className="space-y-3">
                                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Numéro de téléphone</label>
                                                    <div className="relative">
                                                        <input
                                                            type="tel"
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                            placeholder="Ex: 699000000"
                                                            className="w-full h-14 pl-6 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-brand-primary/20 focus:shadow-xl focus:shadow-brand-primary/5 focus:outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Amount Input */}
                                            <div className="space-y-3">
                                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Montant à créditer</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                                        <span className="text-slate-400 font-black">FCFA</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                        placeholder="Ex: 10000"
                                                        className="w-full h-16 pl-20 pr-6 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:bg-white focus:border-brand-primary/20 focus:shadow-xl focus:shadow-brand-primary/5 focus:outline-none font-black text-xl text-slate-900 placeholder:text-slate-300 transition-all"
                                                    />
                                                </div>
                                                <div className="flex gap-2 pl-2">
                                                    {[1000, 5000, 10000, 25000].map(val => (
                                                        <button
                                                            key={val}
                                                            type="button"
                                                            onClick={() => setAmount(val.toString())}
                                                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors"
                                                        >
                                                            {val.toLocaleString()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={!selectedMethod || !amount || processing}
                                                className="w-full h-[64px] bg-gradient-to-r from-brand-primary to-blue-600 hover:to-blue-700 text-white font-black rounded-2xl shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:shadow-brand-primary/30 hover:-translate-y-0.5 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 active:scale-95 disabled:active:scale-100"
                                            >
                                                {processing ? (
                                                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="uppercase tracking-widest text-sm">Confirmer & Recharger</span>
                                                        <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                                                            <ArrowUpRight size={18} />
                                                        </div>
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <History size={24} className="text-slate-400" />
                                Historique
                            </h2>
                            <button className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                                <Filter size={16} className="text-slate-600" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] custom-scrollbar">
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse">
                                        <div className="h-10 w-10 bg-slate-200 rounded-xl" />
                                        <div className="space-y-2">
                                            <div className="h-3 w-24 bg-slate-200 rounded" />
                                            <div className="h-2 w-16 bg-slate-200 rounded" />
                                        </div>
                                    </div>
                                ))
                            ) : transactions && transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <div key={tx.id} className="group p-4 rounded-2xl border border-slate-100 hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/5 transition-all bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-10 w-10 rounded-xl flex items-center justify-center border",
                                                    tx.type === 'deposit' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-500"
                                                )}>
                                                    {tx.type === 'deposit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 text-sm">{tx.description || 'Transaction'}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "font-black text-sm",
                                                    tx.type === 'deposit' ? "text-emerald-600" : "text-slate-900"
                                                )}>
                                                    {tx.type === 'deposit' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString()} F
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                getStatusColor(tx.status)
                                            )}>
                                                {getStatusLabel(tx.status)}
                                            </div>
                                            <p className="text-[10px] font-mono text-slate-300">#{tx.reference}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                                        <Search size={32} className="text-slate-300" />
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm">Aucune transaction trouvée.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
