<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use App\Models\ApiProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Store a newly created order.
     * REFACTORED: Debits balance ONLY after successful API call or for manual service.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'link' => 'required|url',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $service = Service::find($request->service_id);

        // 1. Validate Quantity
        if ($request->quantity < $service->min_quantity || $request->quantity > $service->max_quantity) {
            return response()->json([
                'message' => "La quantité doit être entre {$service->min_quantity} et {$service->max_quantity}."
            ], 422);
        }

        // 2. Calculate Prices
        $costPrice = $service->cost_per_unit * $request->quantity;
        $sellPrice = $service->base_price_per_unit * $request->quantity;

        // 3. Check Balance (Preliminary)
        if ($user->balance < $sellPrice) {
            return response()->json(['message' => 'Solde insuffisant.'], 402);
        }

        // 4. Create Initial Order (Not debited yet)
        $order = Order::create([
            'user_id' => $user->id,
            'service_id' => $service->id,
            'external_provider_id' => $service->api_provider_id,
            'link' => $request->link,
            'quantity' => $request->quantity,
            'cost_price' => $costPrice,
            'sell_price' => $sellPrice,
            'margin_amount' => $sellPrice - $costPrice,
            'net_amount' => $sellPrice - $costPrice,
            'status' => 'pending',
            'placed_via' => 'api',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 5. Automated Service Logic
        $provider = ApiProvider::find($service->api_provider_id);

        if ($provider) {
            $startTime = microtime(true);
            $endpoint = $provider->base_url;
            $requestBody = [
                'key' => $provider->api_key,
                'action' => 'add',
                'service' => $service->external_id,
                'link' => $request->link,
                'quantity' => $request->quantity,
            ];

            try {
                // 5.1 PROACTIVE BALANCE CHECK (User requested)
                Log::info("Checking provider balance before order #{$order->id}");
                $balanceResponse = Http::post($endpoint, [
                    'key' => $provider->api_key,
                    'action' => 'balance'
                ]);

                if ($balanceResponse->successful()) {
                    $balanceData = $balanceResponse->json();
                    $providerBalance = (float) ($balanceData['balance'] ?? 0);
                    $providerCurrency = $balanceData['currency'] ?? 'USD';

                    // Note: costPrice is in XAF. We need to convert it back to provider currency or vice versa.
                    // But wait, the SMM Panel rate is usually USD. 
                    // Let's assume providerBalance is what we compare against.
                    // To be safe, we'll use the cost_per_unit * quantity in USD (which we don't store directly, but we have cost_per_unit in XAF)
                    // Let's get the USD cost back: costPrice / rateUsdXaf
                    $rateUsdXaf = \App\Models\PlatformSetting::where('key', 'currency_rate_usd_xaf')->value('value') ?? 650;
                    $costUsd = $costPrice / $rateUsdXaf;

                    if ($providerBalance < $costUsd) {
                        Log::warning("Insufficient provider balance for order #{$order->id}. Needed: {$costUsd}, Have: {$providerBalance}");
                        $order->update([
                            'status' => 'processing',
                            'api_error' => 'provider_low_balance',
                            'admin_notes' => "Solde fournisseur insuffisant. Requis: {$costUsd} {$providerCurrency}, Dispo: {$providerBalance} {$providerCurrency}"
                        ]);

                        return response()->json([
                            'message' => 'Commande en attente de traitement (Solde fournisseur insuffisant).',
                            'order_id' => $order->id,
                            'status' => 'processing',
                            'api_error' => 'provider_low_balance'
                        ], 202);
                    }
                }

                Log::info("Attempting to place order with provider: {$provider->name}", [
                    'order_id' => $order->id,
                    'endpoint' => $endpoint,
                    'service_id' => $service->external_id,
                    'request' => array_merge($requestBody, ['key' => '***'])
                ]);

                $response = Http::post($endpoint, $requestBody);
                $duration = round((microtime(true) - $startTime) * 1000);
                $apiData = $response->json();

                Log::info("Provider response for order #{$order->id}", [
                    'status' => $response->status(),
                    'body' => $apiData
                ]);

                // Log API Call in Database
                \App\Models\ApiLog::create([
                    'user_id' => $user->id,
                    'method' => 'POST',
                    'endpoint' => $endpoint,
                    'request_body' => array_merge($requestBody, ['key' => '***']),
                    'response_code' => $response->status(),
                    'response_body' => $apiData,
                    'ip_address' => $request->ip(),
                    'duration_ms' => $duration,
                ]);

                if (isset($apiData['order'])) {
                    // API SUCCESS -> DEBIT USER
                    return DB::transaction(function () use ($user, $sellPrice, $order, $apiData, $service) {
                        // Re-check balance inside transaction for atomicity
                        $userRefreshed = $user->fresh();
                        if ($userRefreshed->balance < $sellPrice) {
                            $order->update(['status' => 'failed', 'api_error' => 'Insufficient funds at deduction']);
                            return response()->json(['message' => 'Solde insuffisant au moment du débit.'], 402);
                        }

                        $userRefreshed->decrement('balance', (float) $sellPrice);

                        // Award Referral Commission
                        app(\App\Services\ReferralService::class)->awardOrderCommission($userRefreshed, $order);

                        // Get Wallet Payment Method
                        $walletMethod = \App\Models\PaymentMethod::where('code', 'wallet')->first();

                        // Create Transaction record
                        \App\Models\Transaction::create([
                            'user_id' => $userRefreshed->id,
                            'payment_method_id' => $walletMethod->id ?? 1,
                            'type' => 'order_payment',
                            'amount' => $sellPrice,
                            'fees' => 0,
                            'net_amount' => $sellPrice,
                            'currency' => 'XAF',
                            'status' => 'completed',
                            'description' => "Commande #{$order->id} - {$service->name}",
                            'completed_at' => now(),
                        ]);

                        $order->update([
                            'external_order_id' => $apiData['order'],
                            'status' => 'in_progress',
                            'api_error' => null
                        ]);

                        return response()->json([
                            'message' => 'Commande passée avec succès.',
                            'order' => $order,
                            'balance_after' => $userRefreshed->balance
                        ], 201);
                    });
                } else {
                    // API ERROR -> INFORM ADMIN, DO NOT DEBIT
                    $errorMsg = json_encode($apiData);
                    Log::error("Provider API Error for order #{$order->id}: " . $errorMsg);

                    $apiErrorCode = str_contains($errorMsg, 'not_enough_funds') ? 'provider_low_balance' : 'api_error';

                    $order->update([
                        'status' => 'processing',
                        'api_error' => $apiErrorCode,
                        'admin_notes' => 'API Error Auto-detected: ' . $errorMsg
                    ]);

                    return response()->json([
                        'message' => 'Erreur fournisseur : la commande est en attente de traitement manuel.',
                        'order_id' => $order->id,
                        'status' => 'processing',
                        'api_error' => $apiErrorCode,
                    ], 202);
                }

            } catch (\Exception $e) {
                Log::critical("Exception during order placement for #{$order->id}: " . $e->getMessage());
                $order->update(['status' => 'processing', 'api_error' => 'Connection Exception: ' . $e->getMessage()]);
                return response()->json(['message' => 'Erreur de connexion au fournisseur.', 'order_id' => $order->id, 'error' => $e->getMessage()], 500);
            }
        } else {
            // 6. Manual Service Logic (Debit immediately)
            return DB::transaction(function () use ($user, $sellPrice, $order, $service) {
                $userRefreshed = $user->fresh();
                if ($userRefreshed->balance < $sellPrice) {
                    $order->update(['status' => 'failed', 'api_error' => 'Insufficient funds']);
                    return response()->json(['message' => 'Solde insuffisant.'], 402);
                }

                $userRefreshed->decrement('balance', (float) $sellPrice);
                app(\App\Services\ReferralService::class)->awardOrderCommission($userRefreshed, $order);

                $walletMethod = \App\Models\PaymentMethod::where('code', 'wallet')->first();
                \App\Models\Transaction::create([
                    'user_id' => $userRefreshed->id,
                    'payment_method_id' => $walletMethod->id ?? 1,
                    'type' => 'order_payment',
                    'amount' => $sellPrice,
                    'fees' => 0,
                    'net_amount' => $sellPrice,
                    'currency' => 'XAF',
                    'status' => 'completed',
                    'description' => "Commande #{$order->id} - {$service->name}",
                    'completed_at' => now(),
                ]);

                $order->update(['status' => 'processing']);

                return response()->json([
                    'message' => 'Commande envoyée pour traitement manuel.',
                    'order' => $order,
                    'balance_after' => $userRefreshed->balance
                ], 201);
            });
        }
    }

    /**
     * List user orders.
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['service:id,name'])
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }
}
