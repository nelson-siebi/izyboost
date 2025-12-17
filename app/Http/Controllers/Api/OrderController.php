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
        // DB stores Price Per Unit (e.g. 0.05 FCFA)
        // Total = Unit Price * Quantity
        
        $costPrice = $service->cost_per_unit * $request->quantity;
        $sellPrice = $service->base_price_per_unit * $request->quantity;
        
        // 3. Check Balance
        if ($user->balance < $sellPrice) {
            return response()->json(['message' => 'Solde insuffisant.'], 402);
        }

        // 4. Transaction (DB)
        return DB::transaction(function () use ($user, $service, $request, $costPrice, $sellPrice) {
            
            // Deduct Balance
            $user->decrement('balance', $sellPrice);
            
            // Calculate Margin
            $margin = $sellPrice - $costPrice;

            // Get Wallet Payment Method
            $walletMethod = \App\Models\PaymentMethod::firstOrCreate(
                ['code' => 'wallet'],
                [
                    'name' => 'Solde Principal',
                    'type' => 'ewallet', // Matches enum ['card', 'crypto', 'bank_transfer', 'ewallet', 'mobile_money']
                    'is_active' => true,
                    'min_amount' => 0,
                    'max_amount' => 10000000, 
                    'currencies' => ['XAF', 'EUR', 'USD'],
                    'config' => [],
                ]
            );

            // Create Transaction
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $walletMethod->id,
                'type' => 'order_payment',
                'amount' => $sellPrice,
                'fees' => 0,
                'net_amount' => $sellPrice,
                'currency' => 'XAF', // Assuming default currency
                'status' => 'completed',
                'description' => "Commande #{$service->id} - {$service->name}",
                'completed_at' => now(),
            ]);

            // Create Order Local
            $order = Order::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'external_provider_id' => $service->api_provider_id, // Link to provider
                'link' => $request->link,
                'quantity' => $request->quantity,
                'cost_price' => $costPrice,
                'sell_price' => $sellPrice,
                'margin_amount' => $margin,
                'net_amount' => $margin, // Assuming no commission yet
                'status' => 'pending',
                'placed_via' => 'api', // or mobile/website
                'ip_address' => $request->ip(),
            ]);

            // 5. Send to External API
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
                    $response = Http::post($endpoint, $requestBody);
                    $duration = round((microtime(true) - $startTime) * 1000);
                    $apiData = $response->json();

                    // Mask API Key for Log
                    $logBody = $requestBody;
                    $logBody['key'] = '***';

                    // Log API Call
                    \App\Models\ApiLog::create([
                        'api_key_id' => null, // Internal call
                        'user_id' => $user->id,
                        'method' => 'POST',
                        'endpoint' => $endpoint,
                        'request_body' => $logBody,
                        'response_code' => $response->status(),
                        'response_body' => $apiData,
                        'ip_address' => $request->ip(),
                        'duration_ms' => $duration,
                    ]);

                    if (isset($apiData['order'])) {
                        // Success
                        $order->update([
                            'external_order_id' => $apiData['order'],
                            'status' => 'in_progress' // Assuming instant pass
                        ]);
                    } else {
                        // API Error (e.g. Not enough funds on reseller account)
                        Log::error("Order API Error: " . $response->body());
                        $order->update(['status' => 'processing', 'admin_notes' => 'API Error: ' . json_encode($apiData)]);
                    }

                } catch (\Exception $e) {
                    $duration = round((microtime(true) - $startTime) * 1000);
                    Log::error("Order Exception: " . $e->getMessage());
                    
                    // Mask API Key for Log
                    $logBody = $requestBody;
                    $logBody['key'] = '***';

                    // Log Exception
                    \App\Models\ApiLog::create([
                        'api_key_id' => null,
                        'user_id' => $user->id,
                        'method' => 'POST',
                        'endpoint' => $endpoint,
                        'request_body' => $logBody,
                        'response_code' => 500,
                        'response_body' => ['error' => $e->getMessage()],
                        'ip_address' => $request->ip(),
                        'duration_ms' => $duration,
                    ]);

                    $order->update(['status' => 'processing', 'admin_notes' => 'Exception: ' . $e->getMessage()]);
                }
            }

            return response()->json([
                'message' => 'Commande créée avec succès',
                'order_id' => $order->id,
                'uuid' => $order->uuid,
                'status' => $order->status,
                'price' => $sellPrice,
                'balance_after' => $user->fresh()->balance
            ], 201);
        });
    }

    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['service:id,name'])
            ->latest()
            ->paginate(20);
            
        return response()->json($orders);
    }
}
