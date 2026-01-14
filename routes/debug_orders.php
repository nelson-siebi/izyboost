<?php

use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Support\Facades\Route;

Route::get('/debug/all', function () {
    // 1. ANALYSE DES BOOSTS (COMMANDES SMM)
    $orders = Order::orderBy('id', 'desc')->take(10)->get();

    echo "<h1>1. Diagnostic Boosts (Commandes SMM)</h1>";
    echo "<p>Le Cron <b>smm:update-status</b> vérifie ces commandes.</p>";
    echo "<table border='1' cellpadding='8' style='border-collapse: collapse; width: 100%; margin-bottom: 40px;'>";
    echo "<tr style='background: #f8f9fa;'>
            <th>ID</th>
            <th>Service</th>
            <th>Statut</th>
            <th>ID Externe</th>
            <th>Vérification Cron ?</th>
            <th>Raison / Détail</th>
          </tr>";

    foreach ($orders as $order) {
        $isValidStatus = in_array($order->status, ['pending', 'processing', 'in_progress']);
        $hasExtId = !is_null($order->external_order_id);
        $hasProvider = !is_null($order->external_provider_id);

        $willCheck = $isValidStatus && $hasExtId && $hasProvider;

        $reasons = [];
        if (!$isValidStatus)
            $reasons[] = "Statut '{$order->status}' (nécessite pending, processing ou in_progress)";
        if (!$hasExtId)
            $reasons[] = "Pas d'ID Externe (la commande a échoué chez le fournisseur)";
        if (!$hasProvider)
            $reasons[] = "Pas de fournisseur associé";
        if (empty($reasons))
            $reasons[] = "<b>OK</b> - Sera vérifié prochainement";

        $style = $willCheck ? "background: #dff0d8;" : "background: #f2dede;";

        echo "<tr style='{$style}'>";
        echo "<td>{$order->id}</td>";
        echo "<td>{$order->service_name}</td>";
        echo "<td>{$order->status}</td>";
        echo "<td>" . ($order->external_order_id ?? '---') . "</td>";
        echo "<td>" . ($willCheck ? 'OUI' : 'NON') . "</td>";
        echo "<td>" . implode("<br>", $reasons) . "</td>";
        echo "</tr>";
    }
    echo "</table>";

    // 2. ANALYSE DES PAIEMENTS (TRANSACTIONS)
    $transactions = Transaction::orderBy('id', 'desc')->take(10)->get();

    echo "<h1>2. Diagnostic Paiements (Transactions)</h1>";
    echo "<p>Le Cron <b>transactions:check-status</b> vérifie ces transactions.</p>";
    echo "<table border='1' cellpadding='8' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr style='background: #f8f9fa;'>
            <th>ID</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Statut</th>
            <th>Gateway</th>
            <th>Ref. Gateway</th>
            <th>Vérification Cron ?</th>
            <th>Raison / Détail</th>
          </tr>";

    foreach ($transactions as $tx) {
        $isPending = ($tx->status === 'pending');
        $hasRef = !is_null($tx->gateway_transaction_id);
        $isNelsius = ($tx->gateway === 'nelsius');
        $isRecent = $tx->created_at >= now()->subHours(24);

        $willCheck = $isPending && $hasRef && $isNelsius && $isRecent;

        $reasons = [];
        if (!$isPending)
            $reasons[] = "Statut '{$tx->status}' (nécessite 'pending')";
        if (!$hasRef)
            $reasons[] = "Pas de référence Gateway (ID vide)";
        if (!$isNelsius)
            $reasons[] = "Passerelle '{$tx->gateway}' (seul 'nelsius' est automatique)";
        if (!$isRecent)
            $reasons[] = "Trop ancienne (> 24h)";
        if (empty($reasons))
            $reasons[] = "<b>OK</b> - Sera vérifié prochainement";

        $style = $willCheck ? "background: #dff0d8;" : "background: #f2dede;";

        echo "<tr style='{$style}'>";
        echo "<td>{$tx->id}</td>";
        echo "<td>{$tx->type}</td>";
        echo "<td>" . number_format($tx->amount, 0) . " XAF</td>";
        echo "<td>{$tx->status}</td>";
        echo "<td>{$tx->gateway}</td>";
        echo "<td>" . ($tx->gateway_transaction_id ?? '---') . "</td>";
        echo "<td>" . ($willCheck ? 'OUI' : 'NON') . "</td>";
        echo "<td>" . implode("<br>", $reasons) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
});
