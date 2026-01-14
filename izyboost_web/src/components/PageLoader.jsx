import React from 'react';
import { Loader2 } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-brand-primary animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">Chargement...</p>
            </div>
        </div>
    );
};

export default PageLoader;
