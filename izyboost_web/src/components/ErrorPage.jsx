import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <AlertCircle className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4">Erreur inattendue</h1>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Désolé, une erreur s'est produite lors de l'exécution de l'application.
                    Nous avons été informés et travaillons sur un correctif.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <RefreshCcw className="h-5 w-5" />
                        Recharger la page
                    </button>

                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-3 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                    >
                        <Home className="h-5 w-5" />
                        Retour à l'accueil
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
                        <p className="text-[10px] font-mono text-red-600 break-words">
                            {error?.message || error?.statusText || "Détails de l'erreur non disponibles"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
