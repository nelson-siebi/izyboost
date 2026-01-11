<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\Payment\NelsiusPayService;
use App\Models\User;
use App\Models\PaymentMethod;

$user = User::first();
$method = PaymentMethod::where('type', 'global')->first() ?? PaymentMethod::where('code', 'global_unified')->first();

if (!$method) {
    echo "No global method found\n";
    exit;
}

$nelsiusService = new NelsiusPayService();
$payload = [
    'amount' => 100,
    'currency' => 'XAF',
    'description' => $user->username . " Test Deposit",
    'operator' => 'global',
    'email' => $user->email,
    'success_url' => 'http://localhost:5173/dashboard/wallet?status=success',
    'cancel_url' => 'http://localhost:5173/dashboard/wallet?status=cancel',
];

echo "Initiating payment for user {$user->username} via method {$method->name}...\n";
$result = $nelsiusService->initiatePayment($payload);

print_r($result);
