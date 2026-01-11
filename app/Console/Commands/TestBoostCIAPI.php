<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestBoostCIAPI extends Command
{
    protected $signature = 'test:boostci';
    protected $description = 'Test BoostCI API responses and error formats';

    public function handle()
    {
        $this->info('=== BoostCI API Response Analyzer ===');
        $this->newLine();

        $apiKey = env('SMM_API_KEY');
        $apiUrl = env('SMM_API_URL', 'https://boostci.com/api/v2');

        if (!$apiKey) {
            $this->error('Error: SMM_API_KEY not found in .env');
            return 1;
        }

        $this->info("API URL: $apiUrl");
        $this->info("API Key: " . substr($apiKey, 0, 10) . "...");
        $this->newLine();

        // Test 1: Get Balance
        $this->info('--- Test 1: Get Balance ---');
        try {
            $response = Http::post($apiUrl, [
                'key' => $apiKey,
                'action' => 'balance'
            ]);

            $data = $response->json();
            $this->line("Status: " . $response->status());
            $this->line("Response: " . json_encode($data, JSON_PRETTY_PRINT));
            $this->newLine();

            if (isset($data['balance'])) {
                $this->info("✅ Current Balance: {$data['balance']} {$data['currency']}");
            }
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
        $this->newLine();

        // Test 2: Get Services (first 3)
        $this->info('--- Test 2: Get Services ---');
        try {
            $response = Http::post($apiUrl, [
                'key' => $apiKey,
                'action' => 'services'
            ]);

            $data = $response->json();
            $this->line("Status: " . $response->status());
            $this->info("Total Services: " . count($data));

            if (!empty($data)) {
                $this->line("Sample Services:");
                foreach (array_slice($data, 0, 3) as $service) {
                    $this->line("  - ID: {$service['service']} | {$service['name']} | Min: {$service['min']} | Max: {$service['max']} | Rate: {$service['rate']}");
                }
            }
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
        $this->newLine();

        // Test 3: Simulate Order with Invalid Service
        $this->info('--- Test 3: Test Order Error Response (Invalid Service) ---');
        try {
            $response = Http::post($apiUrl, [
                'key' => $apiKey,
                'action' => 'add',
                'service' => 99999,
                'link' => 'https://tiktok.com/@test',
                'quantity' => 100
            ]);

            $data = $response->json();
            $this->line("Status: " . $response->status());
            $this->line("Response: " . json_encode($data, JSON_PRETTY_PRINT));
            $this->newLine();

            // Analyze error structure
            if (isset($data['error'])) {
                $this->warn("⚠️  Error detected: {$data['error']}");
            }

            // Check for common error patterns
            $responseStr = json_encode($data);
            $this->info('--- Error Pattern Analysis ---');
            $this->line("Contains 'not_enough_funds': " . (str_contains($responseStr, 'not_enough_funds') ? '✅ YES' : '❌ NO'));
            $this->line("Contains 'insufficient': " . (str_contains($responseStr, 'insufficient') ? '✅ YES' : '❌ NO'));
            $this->line("Contains 'balance': " . (str_contains($responseStr, 'balance') ? '✅ YES' : '❌ NO'));
            $this->line("Contains 'error': " . (str_contains($responseStr, 'error') ? '✅ YES' : '❌ NO'));

        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
        $this->newLine();

        // Test 4: Check Order Status
        $this->info('--- Test 4: Check Order Status (with fake ID) ---');
        try {
            $response = Http::post($apiUrl, [
                'key' => $apiKey,
                'action' => 'status',
                'order' => 12345
            ]);

            $data = $response->json();
            $this->line("Status: " . $response->status());
            $this->line("Response: " . json_encode($data, JSON_PRETTY_PRINT));
        } catch (\Exception $e) {
            $this->error("Error: " . $e->getMessage());
        }
        $this->newLine();

        $this->info('=== Analysis Complete ===');
        $this->newLine();
        $this->info('📋 Recommendations:');
        $this->line('1. Check the actual error messages returned by BoostCI');
        $this->line('2. Update error classification in OrderController based on actual responses');
        $this->line('3. Ensure "provider_low_balance" is correctly detected');
        $this->line('4. Consider adding more error types if needed');

        return 0;
    }
}
