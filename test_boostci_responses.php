<?php

/**
 * Test script to analyze BoostCI API responses
 * Run with: php test_boostci_responses.php
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\Http;

// Load environment
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "=== BoostCI API Response Analyzer ===\n\n";

$apiKey = env('BOOSTCI_API_KEY');
$apiUrl = env('BOOSTCI_API_URL', 'https://boostci.com/api/v2');

if (!$apiKey) {
    die("Error: BOOSTCI_API_KEY not found in .env\n");
}

echo "API URL: $apiUrl\n";
echo "API Key: " . substr($apiKey, 0, 10) . "...\n\n";

// Test 1: Get Balance
echo "--- Test 1: Get Balance ---\n";
try {
    $response = Http::post("$apiUrl", [
        'key' => $apiKey,
        'action' => 'balance'
    ]);

    $data = $response->json();
    echo "Status: " . $response->status() . "\n";
    echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

    if (isset($data['balance'])) {
        echo "Current Balance: {$data['balance']} {$data['currency']}\n\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test 2: Get Services
echo "--- Test 2: Get Services ---\n";
try {
    $response = Http::post("$apiUrl", [
        'key' => $apiKey,
        'action' => 'services'
    ]);

    $data = $response->json();
    echo "Status: " . $response->status() . "\n";
    echo "Total Services: " . count($data) . "\n";

    if (!empty($data)) {
        echo "Sample Service:\n";
        echo json_encode($data[0], JSON_PRETTY_PRINT) . "\n\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test 3: Simulate Order with Invalid Service (to see error format)
echo "--- Test 3: Test Order Error Response ---\n";
try {
    $response = Http::post("$apiUrl", [
        'key' => $apiKey,
        'action' => 'add',
        'service' => 99999, // Invalid service
        'link' => 'https://tiktok.com/@test',
        'quantity' => 100
    ]);

    $data = $response->json();
    echo "Status: " . $response->status() . "\n";
    echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

    // Analyze error structure
    if (isset($data['error'])) {
        echo "Error detected: {$data['error']}\n";
    }

    // Check for common error patterns
    $responseStr = json_encode($data);
    echo "\n--- Error Pattern Analysis ---\n";
    echo "Contains 'not_enough_funds': " . (str_contains($responseStr, 'not_enough_funds') ? 'YES' : 'NO') . "\n";
    echo "Contains 'insufficient': " . (str_contains($responseStr, 'insufficient') ? 'YES' : 'NO') . "\n";
    echo "Contains 'balance': " . (str_contains($responseStr, 'balance') ? 'YES' : 'NO') . "\n";
    echo "Contains 'error': " . (str_contains($responseStr, 'error') ? 'YES' : 'NO') . "\n";

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

// Test 4: Check Order Status
echo "\n--- Test 4: Check Order Status (with fake ID) ---\n";
try {
    $response = Http::post("$apiUrl", [
        'key' => $apiKey,
        'action' => 'status',
        'order' => 12345
    ]);

    $data = $response->json();
    echo "Status: " . $response->status() . "\n";
    echo "Response: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n\n";
}

echo "\n=== Analysis Complete ===\n";
echo "\nRecommendations:\n";
echo "1. Check the actual error messages returned by BoostCI\n";
echo "2. Update error classification in OrderController based on actual responses\n";
echo "3. Ensure 'provider_low_balance' is correctly detected\n";
echo "4. Consider adding more error types if needed\n";
