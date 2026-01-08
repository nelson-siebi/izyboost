<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NelsiusPayService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.nelsius.base_url') ?? 'https://api.nelsius.com/api';
        $this->apiKey = config('services.nelsius.api_key') ?? 'pk_P2twhqCSuHLDSjLZ3GHixl23NMDXRxhM'; // User should set this in .env
    }

    /**
     * Initiate a payment (Mobile Money or Global).
     * 
     * @param array $data
     * @return array|mixed
     */
    public function initiatePayment(array $data)
    {
        try {
            // Ensure currency is set
            if (!isset($data['currency'])) {
                $data['currency'] = 'XAF';
            }

            Log::info('Nelsius Pay Request', ['url' => $this->baseUrl . '/v1/payments/mobile-money', 'data' => $data]);

            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($this->baseUrl . '/v1/payments/mobile-money', $data);

            if ($response->successful()) {
                Log::info('Nelsius Pay Success', $response->json());
                return $response->json();
            }

            Log::error('Nelsius Pay Initiation Failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => $response->json('message') ?? 'Erreur lors de l\'initiation du paiement'
            ];
        } catch (\Exception $e) {
            Log::error('Nelsius Pay Exception', ['message' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Erreur de connexion au service de paiement'
            ];
        }
    }

    /**
     * Check payment status.
     */
    public function checkStatus(string $reference)
    {
        try {
            $response = Http::withHeaders([
                'X-API-KEY' => $this->apiKey,
                'Accept' => 'application/json',
            ])->get($this->baseUrl . '/v1/payments/mobile-money/' . $reference);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'message' => 'Impossible de vérifier le statut'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
