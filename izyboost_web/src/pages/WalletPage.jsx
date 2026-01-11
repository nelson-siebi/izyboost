import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, CreditCard, History, ArrowUpRight, ArrowDownLeft, Search, Filter, Plus, Smartphone, Globe, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { walletApi } from '../features/wallet/walletApi';
import { cn } from '../utils/cn';
import apiClient from '../api/client';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [depositMethods, setDepositMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [pollingRef, setPollingRef] = useState(null);
    const [pollingStatus, setPollingStatus] = useState('pending'); // 'pending', 'completed', 'failed'
    const [pollingMessage, setPollingMessage] = useState('Vérification en cours...');

    // Use useRef to store interval ID to avoid stale closure issues
    const pollingIntervalRef = useRef(null);

    useEffect(() => {
        loadData();

        // Cleanup on unmount
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, []);

    // Detect redirect from payment gateway
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const ref = query.get('ref') || query.get('reference');
        const status = query.get('status');

        if (ref && (status === 'success' || !status)) {
            // If we have a reference and just landed here, start polling
            startPolling(ref);
            // Optional: clean up URL after detecting ref to avoid re-triggering on refresh
            // navigate('/dashboard/wallet', { replace: true }); 
            // Actually, keep it for now so refresh stays in polling state if not finished
        }
    }, [location.search]);

    const startPolling = (reference) => {
        // Clear any existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        setPollingRef(reference);

        const interval = setInterval(async () => {
            try {
                const statusData = await walletApi.checkStatus(reference);
                console.log('Polling status for ' + reference + ':', statusData);

                if (statusData.message) {
                    setPollingMessage(statusData.message);
                }

                // Use the normalized status from backend if available, or fall back to statusData.status
                const currentStatus = statusData.status;
                setPollingStatus(currentStatus);

                if (currentStatus === 'completed' || currentStatus === 'successful' || currentStatus === 'success') {
                    setPollingStatus('completed'); // Local normalization for UI
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;

                    // Small delay to let the user see the "Success" state
                    setTimeout(() => {
                        setPollingRef(null);
                        setPollingStatus('pending');
                        setNotification({ type: 'success', message: 'Félicitations ! Votre compte a été crédité.' });
                        loadData();
                    }, 3000);
                } else if (currentStatus === 'failed' || currentStatus === 'error' || currentStatus === 'canceled' || currentStatus === 'expired' || currentStatus === 'rejected') {
                    setPollingStatus('failed'); // Local normalization for UI
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;

                    setTimeout(() => {
                        setPollingRef(null);
                        setPollingStatus('pending');
                        setNotification({ type: 'error', message: 'Le paiement a échoué ou a été annulé.' });
                        loadData();
                    }, 3000);
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        }, 3000);

        pollingIntervalRef.current = interval;
    };

    const resolveImgUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = apiClient.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
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
            setDepositMethods(methodsData);
            setTransactions(txData.data || txData);
        } catch (error) {
            console.error('Failed to load wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        if (!selectedMethod || !amount) return;

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

            if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                setNotification({ type: 'success', message: 'Demande envoyée ! Veuillez valider sur votre mobile.' });
                setAmount('');
                setPhoneNumber('');

                if (response.reference) {
                    startPolling(response.reference);
                }

                loadData();
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
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Solde Dispo.</p>
                        <p className="text-xl font-black text-slate-900">{Number(balance).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA</p>
                    </div>
                </div>
            </header>



            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Deposit Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 z-0" />

                        <div className="relative z-10">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Plus size={20} />
                                </div>
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
                                <motion.div
                                    key="form-state"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
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
                                                                            ? "border-emerald-500 bg-emerald-50 shadow-md ring-1 ring-emerald-500/20"
                                                                            : "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm"
                                                                    )}
                                                                >
                                                                    {selectedMethod?.id === method.id && (
                                                                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 shadow-sm" />
                                                                    )}
                                                                    <div className={cn(
                                                                        "h-12 w-12 rounded-xl flex items-center justify-center transition-colors overflow-hidden",
                                                                        selectedMethod?.id === method.id ? "bg-white" : "bg-slate-50"
                                                                    )}>
                                                                        {method.logo ? (
                                                                            <img
                                                                                src={resolveImgUrl(method.logo)}
                                                                                alt={method.name}
                                                                                className="h-full w-full object-contain p-1"
                                                                            />
                                                                        ) : (
                                                                            method.type === 'crypto' ? <Globe size={24} /> : <Smartphone size={24} />
                                                                        )}
                                                                    </div>
                                                                    <span className={cn(
                                                                        "font-bold text-xs text-center",
                                                                        selectedMethod?.id === method.id ? "text-emerald-700" : "text-slate-600"
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
                                                    className="w-full h-12 pl-4 pr-4 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none font-bold text-lg text-slate-900 placeholder:text-slate-300 transition-all"
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
                                                className="w-full h-14 pl-16 pr-4 rounded-xl bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none font-bold text-xl text-slate-900 placeholder:text-slate-300 transition-all"
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
                                        className={cn(
                                            "w-full h-14 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95",
                                            processing
                                                ? "bg-emerald-600 cursor-wait opacity-90"
                                                : (!selectedMethod || !amount)
                                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-600/20 hover:-translate-y-0.5"
                                        )}
                                    >
                                        {processing ? (
                                            <>
                                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Traitement...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="uppercase tracking-wide text-xs">Confirmer & Recharger</span>
                                                <ArrowUpRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                    </div >
                </div >

                {/* History Section */}
                < div className="lg:col-span-5 space-y-6" >
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
                                    <div key={tx.id} className="group p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all bg-white">
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
                                                    {tx.type === 'deposit' ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F
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
                </div >
            </div >
            {/* Transaction History Overlay when polling */}
            < AnimatePresence >
                {pollingRef && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 z-0" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-50 rounded-full -ml-16 -mb-16 z-0" />

                            <div className="relative z-10 p-10 flex flex-col items-center text-center space-y-8">
                                <div className="relative">
                                    <div className={cn(
                                        "h-24 w-24 rounded-full border-4 transition-all duration-700",
                                        pollingStatus === 'completed' ? "border-emerald-100 border-t-emerald-600 scale-110" :
                                            pollingStatus === 'failed' ? "border-red-100 border-t-red-600" :
                                                "border-emerald-100 border-t-emerald-600 animate-spin"
                                    )} />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {pollingStatus === 'completed' ? (
                                            <CheckCircle2 size={40} className="text-emerald-600" />
                                        ) : pollingStatus === 'failed' ? (
                                            <AlertCircle size={40} className="text-red-600" />
                                        ) : (
                                            <Smartphone size={32} className="text-emerald-600 animate-pulse" />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className={cn(
                                        "text-2xl font-black tracking-tight transition-colors",
                                        pollingStatus === 'completed' ? "text-emerald-600" :
                                            pollingStatus === 'failed' ? "text-red-600" : "text-slate-900"
                                    )}>
                                        {pollingStatus === 'completed' ? "Paiement Confirmé !" :
                                            pollingStatus === 'failed' ? "Transaction Échouée" :
                                                (phoneNumber ? "Action Requise" : "Vérification...")}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-base">
                                        {pollingStatus === 'completed' ? "Félicitations ! Votre recharge a été traitée avec succès." :
                                            pollingStatus === 'failed' ? "Désolé, nous n'avons pas pu confirmer votre paiement." :
                                                pollingMessage}
                                    </p>
                                </div>

                                {pollingStatus === 'pending' ? (
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ x: "-100%" }}
                                                animate={{ x: "100%" }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                                className="h-full w-1/3 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(5,150,105,0.5)]"
                                            />
                                        </div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                            Sécurisation de la transaction
                                        </p>
                                    </div>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => {
                                            setPollingRef(null);
                                            setPollingStatus('pending');
                                        }}
                                        className={cn(
                                            "w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95",
                                            pollingStatus === 'completed' ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                                        )}
                                    >
                                        Retour au portefeuille
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
}
