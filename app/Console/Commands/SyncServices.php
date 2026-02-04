<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\ApiProvider;
use App\Models\Service;
use App\Models\Category;
use Illuminate\Support\Str;

class SyncServices extends Command
{
    protected $signature = 'smm:sync-services {provider_id? : Optional ID of the provider to sync}';
    protected $description = 'Import services from external API provider';

    public function handle()
    {
        // 1. Get Provider (Use ID or Default)
        $providerId = $this->argument('provider_id');

        if ($providerId) {
            $provider = ApiProvider::find($providerId);
        } else {
            // Find default provider or first one
            $provider = ApiProvider::first();
        }

        if (!$provider) {
            // Create default provider if none exists (Bootstrap)
            $apiKey = env('SMM_API_KEY');
            $apiUrl = env('SMM_API_URL');

            if (!$apiKey || !$apiUrl) {
                $this->error('No API Key/URL found in .env and no provider in DB.');
                return;
            }

            $provider = ApiProvider::create([
                'name' => 'BoostCI (Default)',
                'code' => 'boostci',
                'base_url' => $apiUrl,
                'api_key' => $apiKey,
                'status' => 'active',
            ]);
            $this->info("Created default provider: " . $provider->name);
        }

        $this->info("Syncing services from: " . $provider->name);

        // 2. Fetch Services from API
        $response = Http::withoutVerifying()->post($provider->base_url, [
            'key' => $provider->api_key,
            'action' => 'services',
        ]);

        if ($response->failed() || !is_array($response->json())) {
            $this->error('Failed to fetch services from API. Response: ' . $response->body());
            return;
        }

        $services = $response->json();
        $this->info("Found " . count($services) . " services.");

        // 2.1 DEACTIVATE ALL OLD SERVICES FOR THIS PROVIDER (to handle removals)
        Service::where('api_provider_id', $provider->id)->update(['is_active' => false]);
        $this->info("Deactivated existing services for cleanup...");

        // 3. Settings (Currency & Margin)
        $rateUsdXaf = \App\Models\PlatformSetting::where('key', 'currency_rate_usd_xaf')->value('value') ?? 650;
        $marginPercent = \App\Models\PlatformSetting::where('key', 'default_user_margin')->value('value') ?? 30; // Matches admin UI key

        $bar = $this->output->createProgressBar(count($services));
        $bar->start();

        foreach ($services as $serviceData) {
            // 4. Handle Category
            $categoryName = $serviceData['category'] ?? 'Uncategorized';
            $category = Category::firstOrCreate(
                ['name' => $categoryName],
                [
                    'slug' => Str::slug($categoryName),
                    'is_active' => true,
                    'position' => 99
                ]
            );

            // 5. Calculate Price (USD -> XAF + Margin)
            // Note: Rate from API is usually per 1000 units.
            // But DB stores cost_per_unit as per 1 unit? 
            // Checking schema: decimal(12,6) -> supports small numbers.
            // Let's assume we store "Price per 1000" because that's standard in SMM panels
            // But schema name is 'cost_per_unit'... confusing.
            // Let's store the full rate (per 1000) for now, as 6 decimals allows it.
            $rateUsd = $serviceData['rate'] ?? 0;
            $costXaf = $rateUsd * $rateUsdXaf;
            $basePriceXaf = $costXaf * (1 + ($marginPercent / 100));

            // 6. Update or Create Service
            Service::updateOrCreate(
                [
                    'api_provider_id' => $provider->id,
                    'external_id' => $serviceData['service'],
                ],
                [
                    'name' => $serviceData['name'],
                    'category_id' => $category->id,
                    'type' => $this->mapServiceType($serviceData['type'] ?? 'default'),
                    'min_quantity' => $serviceData['min'],
                    'max_quantity' => $serviceData['max'],
                    'cost_per_unit' => $costXaf / 1000,
                    'base_price_per_unit' => $basePriceXaf / 1000,
                    'provider' => $provider->name, // Required string
                    'drip_feed' => $serviceData['dripfeed'] ?? false,
                    'is_active' => true,
                ]
            );

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Services synced successfully!');
    }

    private function mapServiceType($apiType)
    {
        $type = strtolower($apiType);

        if (str_contains($type, 'comment')) {
            return 'custom_comments';
        }

        if (str_contains($type, 'package')) {
            return 'package';
        }

        return 'default';
    }
}
