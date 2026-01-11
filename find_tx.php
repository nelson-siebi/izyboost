<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Transaction;

$ref = '2017d880-08f8-49e7-8385-62f98e9c902e';

echo "Searching for reference: $ref\n";

$t = Transaction::where('gateway_transaction_id', $ref)
    ->orWhere('reference', $ref)
    ->orWhere('uuid', $ref)
    ->first();

if ($t) {
    echo "Found via direct column match!\n";
    echo "ID: {$t->id}\n";
    echo "Gateway ID: {$t->gateway_transaction_id}\n";
    echo "Reference: {$t->reference}\n";
    echo "UUID: {$t->uuid}\n";
    exit;
}

$t = Transaction::where('gateway_response', 'LIKE', "%$ref%")->first();
if ($t) {
    echo "Found inside gateway_response JSON!\n";
    echo "ID: {$t->id}\n";
    echo "Gateway ID: {$t->gateway_transaction_id}\n";
    echo "Reference: {$t->reference}\n";
    print_r($t->gateway_response);
    exit;
}

echo "NOT FOUND IN DATABASE.\n";

echo "\nLatest 5 transactions for context:\n";
print_r(Transaction::latest()->limit(5)->get(['id', 'gateway_transaction_id', 'reference', 'uuid', 'created_at'])->toArray());
