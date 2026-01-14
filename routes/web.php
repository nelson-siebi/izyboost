<?php

use Illuminate\Support\Facades\Route;
require_once __DIR__ . '/debug_orders.php';

// Route pour Cronjob externe (Sécurisée par une clé)
Route::get('/cron/run/status-update', function () {
    $key = request('key');
    // Remplacez 'VOTRE_SECRET_KEY' par une clé complexe de votre choix
    if ($key !== 'nexky237') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('smm:update-status');
        return "BOOSTS STATUS: <br>" . nl2br(\Illuminate\Support\Facades\Artisan::output());
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// Route spécifique pour les PAIEMENTS (Transactions)
Route::get('/cron/run/transactions', function () {
    $key = request('key');
    if ($key !== 'nexky237') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('transactions:check-status');
        return "TRANSACTIONS STATUS: <br>" . nl2br(\Illuminate\Support\Facades\Artisan::output());
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// Route pour exécuter TOUT le planificateur (Scheduler)
Route::get('/cron/run/all', function () {
    $key = request('key');
    if ($key !== 'nexky237') {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    try {
        \Illuminate\Support\Facades\Artisan::call('schedule:run');
        return "Scheduler executed! <br>" . nl2br(\Illuminate\Support\Facades\Artisan::output());
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

// Cette route "catch-all" permet à React de gérer le routage à partir de Laravel
Route::get('{any}', function () {
    $path = public_path('index.html');
    if (file_exists($path)) {
        return file_get_contents($path);
    }
    return "React index.html not found in public directory. Please run build and copy files.";
})->where('any', '.*');