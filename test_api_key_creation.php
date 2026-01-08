<?php

// Test script to verify API key creation
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ApiKey;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

echo "🔑 Test de création de clé API\n\n";

// Find a test user
$user = User::where('email', 'nelsonsiebi237@gmail.com')->first();

if (!$user) {
    echo "❌ Utilisateur de test non trouvé\n";
    exit(1);
}

echo "✅ Utilisateur trouvé: {$user->username} (ID: {$user->id})\n";

// Generate API key
$key = 'sk_' . Str::random(48);
$secret = Str::random(64);
$permissions = ['services.read', 'orders.read', 'balance.read'];

echo "🔧 Génération de la clé...\n";
echo "   Key: {$key}\n";
echo "   Permissions: " . implode(', ', $permissions) . "\n";

try {
    $apiKey = $user->apiKeys()->create([
        'name' => 'Test Key from Script',
        'key' => $key,
        'secret' => Hash::make($secret),
        'type' => 'secret',
        'permissions' => $permissions,
        'rate_limit' => 100,
        'expires_at' => null,
        'is_active' => true,
    ]);

    echo "\n✅ Clé API créée avec succès!\n";
    echo "   ID: {$apiKey->id}\n";
    echo "   Name: {$apiKey->name}\n";
    echo "   Key: {$apiKey->key}\n";
    echo "   Rate Limit: {$apiKey->rate_limit}\n";

    // Clean up
    echo "\n🧹 Nettoyage...\n";
    $apiKey->delete();
    echo "✅ Clé de test supprimée\n";

} catch (\Exception $e) {
    echo "\n❌ ERREUR lors de la création:\n";
    echo "   Message: {$e->getMessage()}\n";
    echo "   File: {$e->getFile()}:{$e->getLine()}\n";
    echo "\n   Stack trace:\n";
    echo $e->getTraceAsString();
    exit(1);
}

echo "\n✅ Test terminé avec succès!\n";
