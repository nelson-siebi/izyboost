import React, { useState } from 'react';

import {
    Terminal,
    Key,
    Send,
    Layout,
    Copy,
    CheckCircle2,
    ArrowRight,
    Code,
    ShieldCheck,
    Zap,
    AlertCircle,
    Info,
    Smartphone,
    Search
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function DocumentationPage() {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            method: 'GET',
            path: '/v1/balance',
            title: 'Solde du Compte',
            description: 'Récupérez le solde actuel de votre compte et la devise associée. Indispensable pour vérifier si vous avez assez de fonds avant de commander.',
            example: {
                curl: `curl -X GET "https://izyboost.nelsius.com/api/v1/balance" \\
-H "X-API-Key: VOTRE_CLE_API"`,
                php: `<?php
$ch = curl_init("https://izyboost.nelsius.com/api/v1/balance");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: VOTRE_CLE_API']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
echo $res;`,
                python: `import requests
res = requests.get(
    "https://izyboost.nelsius.com/api/v1/balance",
    headers={"X-API-Key": "VOTRE_CLE_API"}
)
print(res.json())`
            },
            response: `{
  "success": true,
  "data": {
    "balance": 25000.50,
    "currency": "XAF",
    "formatted": "25 000.50 XAF"
  }
}`
        },
        {
            method: 'GET',
            path: '/v1/services',
            title: 'Liste des Services',
            description: 'Récupérez tous les services disponibles groupés par catégorie. Utilisez le service_id pour passer vos commandes.',
            example: {
                curl: `curl -X GET "https://izyboost.nelsius.com/api/v1/services" \\
-H "X-API-Key: VOTRE_CLE_API"`,
                php: `<?php
$ch = curl_init("https://izyboost.nelsius.com/api/v1/services");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: VOTRE_CLE_API']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
print_r(json_decode($res, true));`,
                python: `import requests
res = requests.get("https://izyboost.nelsius.com/api/v1/services", headers={"X-API-Key": "VOTRE_CLE_API"})
services = res.json()['data']`
            },
            response: `{
  "success": true,
  "data": [
    {
      "id": 1,
      "category": "Instagram Followers",
      "services": [
        {
          "id": 101,
          "name": "HQ Followers [Instant]",
          "min": 100,
          "max": 10000,
          "rate": 0.05
        }
      ]
    }
  ]
}`
        },
        {
            method: 'POST',
            path: '/v1/orders',
            title: 'Créer une Commande',
            description: 'Automatisez vos commandes. Le montant est automatiquement déduit de votre solde.',
            example: {
                curl: `curl -X POST "https://izyboost.nelsius.com/api/v1/orders" \\
-H "X-API-Key: VOTRE_CLE_API" \\
-H "Content-Type: application/json" \\
-d '{
  "service_id": 101,
  "link": "https://instagram.com/p/...",
  "quantity": 1000
}'`,
                php: `<?php
$data = ['service_id' => 101, 'link' => 'https://...', 'quantity' => 1000];
$ch = curl_init("https://izyboost.nelsius.com/api/v1/orders");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: VOTRE_CLE_API', 'Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);`,
                python: `import requests
data = {"service_id": 101, "link": "https://...", "quantity": 1000}
res = requests.post("https://izyboost.nelsius.com/api/v1/orders", json=data, headers={"X-API-Key": "VOTRE_CLE_API"})`
            },
            response: `{
  "success": true,
  "data": {
    "order_id": 5432,
    "status": "pending",
    "charge": 50.00,
    "currency": "XAF"
  }
}`
        },
        {
            method: 'GET',
            path: '/v1/orders/{id}',
            title: 'Statut de Commande',
            description: 'Vérifiez l\'avancement de vos boosts en temps réel.',
            example: {
                curl: `curl -X GET "https://izyboost.nelsius.com/api/v1/orders/5432" \\
-H "X-API-Key: VOTRE_CLE_API"`,
                php: `<?php
$ch = curl_init("https://izyboost.nelsius.com/api/v1/orders/5432");
curl_setopt($ch, CURLOPT_HTTPHEADER, ['X-API-Key: VOTRE_CLE_API']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);`,
                python: `import requests
res = requests.get("https://izyboost.nelsius.com/api/v1/orders/5432", headers={"X-API-Key": "VOTRE_CLE_API"})`
            },
            response: `{
  "success": true,
  "data": {
    "order_id": 5432,
    "status": "processing",
    "start_count": 1200,
    "remains": 450,
    "created_at": "2024-03-20T10:00:00Z"
  }
}`
        }
    ];

    const errorCodes = [
        { code: '401', title: 'Unauthorized', message: 'Clé API manquante ou invalide.' },
        { code: '403', title: 'Forbidden', message: 'Permission refusée pour cette action ou IP non autorisée.' },
        { code: '402', title: 'Payment Required', message: 'Solde insuffisant pour effectuer la commande.' },
        { code: '422', title: 'Unprocessable Entity', message: 'Données invalides (ex: quantité hors limites).' },
        { code: '404', title: 'Not Found', message: 'Le service ou la commande demandé n\'existe pas.' }
    ];

    const [selectedLang, setSelectedLang] = useState('curl');

    return (
        <div className="space-y-16 max-w-5xl mx-auto pb-24">
            {/* Hero Section */}
            <header className="relative py-12 text-center space-y-6">
                <div className="absolute inset-0 bg-brand-primary/5 rounded-[64px] blur-3xl -z-10" />
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 animate-[fade-in-up_0.5s_ease-out]"
                >
                    <Terminal size={14} /> Documentation API v1.2
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight">Elite <span className="text-brand-primary">API</span></h1>
                <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                    La documentation complète pour les développeurs et revendeurs souhaitant automatiser leurs services de boost.
                </p>
            </header>

            {/* Auth Section */}
            <section className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <Key size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Authentification</h2>
                        <p className="text-slate-500 font-medium">Sécurisez vos appels API en quelques secondes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            Nous supportons deux méthodes d'authentification. La méthode recommandée est l'utilisation du header <code className="text-brand-primary px-1 font-black">X-API-Key</code>.
                        </p>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-400">Header Option 1</h4>
                            <code className="text-xs font-mono font-bold block bg-white p-3 rounded-lg border border-slate-100">X-API-Key: VOTRE_CLE_API</code>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                            <h4 className="text-xs font-black uppercase text-slate-400">Header Option 2 (Bearer)</h4>
                            <code className="text-xs font-mono font-bold block bg-white p-3 rounded-lg border border-slate-100">Authorization: Bearer VOTRE_CLE_API</code>
                        </div>
                    </div>
                    <div className="bg-amber-50 p-8 rounded-[32px] border border-amber-100 flex gap-5">
                        <Info className="text-amber-600 shrink-0 mt-1" size={24} />
                        <div className="space-y-2">
                            <h4 className="font-black text-amber-900">Important</h4>
                            <p className="text-sm text-amber-800 font-medium leading-relaxed">
                                Gardez votre clé API secrète. En cas de suspicion de compromission, régénérez-la immédiatement depuis votre tableau de bord.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Endpoints */}
            <div className="space-y-20">
                <div className="flex items-center gap-4 px-4">
                    <div className="h-10 w-1 bg-brand-primary rounded-full shadow-lg shadow-brand-primary" />
                    <h2 className="text-3xl font-black text-slate-900">Endpoints Disponibles</h2>
                </div>

                {endpoints.map((ep, i) => (
                    <section key={i} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase",
                                ep.method === 'GET' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                            )}>
                                {ep.method}
                            </span>
                            <h3 className="text-2xl font-black text-slate-800">{ep.title}</h3>
                            <code className="text-slate-400 font-bold ml-auto hidden md:block">{ep.path}</code>
                        </div>
                        <p className="text-slate-500 font-medium ml-1">{ep.description}</p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                            <div className="bg-slate-950 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
                                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                                    <div className="flex gap-4">
                                        {['curl', 'php', 'python'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => setSelectedLang(lang)}
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest transition-colors pb-1 border-b-2",
                                                    selectedLang === lang ? "text-brand-primary border-brand-primary" : "text-slate-500 border-transparent hover:text-slate-300"
                                                )}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => copyToClipboard(ep.example[selectedLang], `req-${i}-${selectedLang}`)} className="text-slate-500 hover:text-white transition-colors p-2">
                                        {copied === `req-${i}-${selectedLang}` ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="p-8 h-[250px] overflow-y-auto custom-scrollbar">
                                    <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                                        {ep.example[selectedLang]}
                                    </pre>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-2xl">
                                <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-brand-primary/50" /> Réponse
                                    </span>
                                    <button onClick={() => copyToClipboard(ep.response, `res-${i}`)} className="text-slate-500 hover:text-white transition-colors p-2">
                                        {copied === `res-${i}` ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="p-8"><pre className="text-xs font-mono text-brand-primary/80 leading-relaxed overflow-x-auto">{ep.response}</pre></div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* Error Codes Table */}
            <section className="bg-slate-50 rounded-[48px] p-12 space-y-8 border border-slate-100">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">Codes de Réponse</h2>
                    <p className="text-slate-500 font-medium">Comprenez et gérez les erreurs efficacement.</p>
                </div>

                <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Code</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Type</th>
                                <th className="px-8 py-5 text-xs font-black uppercase text-slate-400 tracking-widest">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {errorCodes.map((err, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-6 font-black text-slate-900">{err.code}</td>
                                    <td className="px-8 py-6 font-bold text-slate-500 text-sm whitespace-nowrap">{err.title}</td>
                                    <td className="px-8 py-6 font-medium text-slate-400 text-sm">{err.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* CTA Final */}
            <div className="bg-brand-primary p-16 rounded-[64px] text-white overflow-hidden relative group text-center md:text-left">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-4xl lg:text-5xl font-black leading-tight italic">Prêt à dominer le marché ?</h3>
                        <p className="text-white/80 font-bold text-xl leading-relaxed max-w-xl">Intégrez nos solutions industrielles et laissez votre business tourner en pilote automatique 24/7.</p>
                        <button className="px-12 py-5 bg-white text-brand-primary rounded-[24px] font-black flex items-center gap-3 mx-auto md:mx-0 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            Démarrer l'Intégration <ArrowRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
