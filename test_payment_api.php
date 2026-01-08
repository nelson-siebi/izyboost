<?php

use App\Services\Payment\NelsiusPayService;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = new NelsiusPayService();

function testProcess($name, $payload, $service)
{
    echo "=== TEST: $name ===\n";

    // 1. Initiation
    echo "1. Initiation en cours...\n";
    $initResponse = $service->initiatePayment($payload);

    $ref = null;
    if (isset($initResponse['data']['reference'])) {
        $ref = $initResponse['data']['reference'];
    } elseif (isset($initResponse['reference'])) {
        $ref = $initResponse['reference'];
    } elseif (isset($initResponse['data']['transaction']['reference'])) {
        $ref = $initResponse['data']['transaction']['reference'];
    }

    if (!$ref) {
        echo "ERREUR Initiation: Pas de référence reçue.\n";
        echo "Détails: " . json_encode($initResponse, JSON_PRETTY_PRINT) . "\n\n";
        return;
    }

    echo "SUCCESS: Paiement initié. Réf: $ref\n";
    if (isset($initResponse['data']['payment_url'])) {
        echo "URL de redirection: " . $initResponse['data']['payment_url'] . "\n";
    }

    // 2. Vérification du Statut
    echo "2. Vérification du statut pour $ref...\n";
    $statusResponse = $service->checkStatus($ref);

    echo "Réponse Statut API: " . json_encode($statusResponse, JSON_PRETTY_PRINT) . "\n";

    $status = $statusResponse['data']['status'] ?? $statusResponse['status'] ?? 'inconnu';
    echo "STATUT FINAL: $status\n\n";
}

// TEST 1: GLOBAL
testProcess("GLOBAL (Visa/MasterCard/PayPal)", [
    'operator' => 'global',
    'amount' => 100,
    'currency' => 'XAF',
    'email' => 'test@izyboost.com',
    'success_url' => 'https://izyboost.com/wallet?status=success',
    'description' => 'Test Global Lifecycle'
], $service);

// TEST 2: ORANGE MONEY
testProcess("ORANGE MONEY CAMEROUN", [
    'operator' => 'orange_money',
    'phone' => '699000000',
    'amount' => 100,
    'currency' => 'XAF',
    'description' => 'Test Orange Lifecycle'
], $service);

// TEST 3: MTN MONEY
testProcess("MTN MONEY CAMEROUN", [
    'operator' => 'mtn_money',
    'phone' => '670000000',
    'amount' => 100,
    'currency' => 'XAF',
    'description' => 'Test MTN Lifecycle'
], $service);

echo "--- FIN DES TESTS DE CYCLE DE VIE ---\n";
