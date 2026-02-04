<?php

namespace App\Services\Payment;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NelsiusPayService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $apiSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.nelsius.base_url') ?? 'https://api.nelsius.com/api';
        $this->apiKey = config('services.nelsius.api_key') ?? 'pk_kNrraS2Y3w4HPThKbSnevFGi4H7LlmK6';
        $this->apiSecret = config('services.nelsius.api_secret') ?? 'sk_lhjGbhdCTLk0lxDYUQeAorazWGQZlJK5e1er5fNmoUcOpGJnnDBfF2qqdaRBvLgo';
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

            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'X-API-SECRET' => $this->apiSecret,
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

            $errorMessage = $response->json('message') ?? 'Erreur lors de l\'initiation du paiement';

            // Append detailed validation errors with human-friendly mapping
            $errors = $response->json('errors');
            if (is_array($errors)) {
                $detailedErrors = [];
                $errorMap = [
                    'validation.regex' => 'Format invalide',
                    'validation.min.string' => 'Trop court (min. 9 chiffres)',
                    'validation.max.string' => 'Trop long',
                    'validation.numeric' => 'Doit être numérique',
                    'validation.required' => 'Requis'
                ];

                foreach ($errors as $field => $messages) {
                    $msgs = is_array($messages) ? $messages : [$messages];
                    foreach ($msgs as &$msg) {
                        $msg = $errorMap[$msg] ?? $msg;
                    }
                    $fieldLabel = ($field === 'phone') ? 'Téléphone' : $field;
                    $detailedErrors[] = "$fieldLabel: " . implode(', ', $msgs);
                }
                if (!empty($detailedErrors)) {
                    $errorMessage = implode(' | ', $detailedErrors);
                }
            }

            return [
                'success' => false,
                'message' => $errorMessage
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
            $response = Http::withoutVerifying()->withHeaders([
                'X-API-KEY' => $this->apiKey,
                'X-API-SECRET' => $this->apiSecret,
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
