<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeveloperOrderController extends Controller
{
    /**
     * Create an order via API.
     */
    public function store(Request $request)
    {
        $apiKey = $request->get('api_key');

        if (!in_array('orders.create', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée',
                'message' => 'Votre clé API n\'a pas la permission orders.create'
            ], 403);
        }

        $request->validate([
            'service_id' => 'required|exists:services,id',
            'link' => 'required|url',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $apiKey->user;
        $service = Service::find($request->service_id);

        // Validate quantity
        if ($request->quantity < $service->min_quantity || $request->quantity > $service->max_quantity) {
            return response()->json([
                'error' => 'Quantité invalide',
                'message' => "La quantité doit être entre {$service->min_quantity} et {$service->max_quantity}."
            ], 422);
        }

        // Calculate prices
        $costPrice = $service->cost_per_unit * $request->quantity;
        $sellPrice = $service->base_price_per_unit * $request->quantity;

        // Check balance
        if ($user->balance < $sellPrice) {
            return response()->json([
                'error' => 'Solde insuffisant',
                'balance' => $user->balance,
                'required' => $sellPrice
            ], 402);
        }

        return DB::transaction(function () use ($user, $service, $request, $costPrice, $sellPrice, $apiKey) {

            $user->decrement('balance', $sellPrice);
            $margin = $sellPrice - $costPrice;

            // Get wallet method
            $walletMethod = \App\Models\PaymentMethod::firstOrCreate(
                ['code' => 'wallet'],
                [
                    'name' => 'Solde Principal',
                    'type' => 'ewallet',
                    'is_active' => true,
                    'min_amount' => 0,
                    'max_amount' => 10000000,
                    'currencies' => ['XAF', 'EUR', 'USD'],
                    'config' => [],
                ]
            );

            // Create transaction
            \App\Models\Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $walletMethod->id,
                'type' => 'order_payment',
                'amount' => $sellPrice,
                'fees' => 0,
                'net_amount' => $sellPrice,
                'currency' => 'XAF',
                'status' => 'completed',
                'description' => "Commande API #{$service->id} - {$service->name}",
                'completed_at' => now(),
            ]);

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'service_id' => $service->id,
                'api_key_id' => $apiKey->id,
                'external_provider_id' => $service->api_provider_id,
                'link' => $request->link,
                'quantity' => $request->quantity,
                'cost_price' => $costPrice,
                'sell_price' => $sellPrice,
                'margin_amount' => $margin,
                'net_amount' => $margin,
                'status' => 'pending',
                'placed_via' => 'api',
                'ip_address' => $request->ip(),
            ]);

            // Send to external provider (same logic as OrderController)
            $provider = \App\Models\ApiProvider::find($service->api_provider_id);

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
                    $response = \Illuminate\Support\Facades\Http::post($endpoint, $requestBody);
                    $duration = round((microtime(true) - $startTime) * 1000);
                    $apiData = $response->json();

                    if (isset($apiData['order'])) {
                        $order->update([
                            'external_order_id' => $apiData['order'],
                            'status' => 'in_progress'
                        ]);
                    } else {
                        $order->update(['status' => 'processing']);
                    }
                } catch (\Exception $e) {
                    $order->update(['status' => 'processing']);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'uuid' => $order->uuid,
                    'status' => $order->status,
                    'service' => $service->name,
                    'quantity' => $order->quantity,
                    'charge' => $sellPrice,
                    'balance' => $user->fresh()->balance,
                ]
            ], 201);
        });
    }

    /**
     * List orders.
     */
    public function index(Request $request)
    {
        $apiKey = $request->get('api_key');

        if (!in_array('orders.read', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée'
            ], 403);
        }

        $orders = $apiKey->user->orders()
            ->with(['service:id,name'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get order status.
     * Supports single ID or multiple IDs separated by comma.
     */
    public function status(Request $request, $id)
    {
        $apiKey = $request->get('api_key');

        if (!in_array('orders.read', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée'
            ], 403);
        }

        $ids = explode(',', $id);

        if (count($ids) > 1) {
            $orders = $apiKey->user->orders()->whereIn('id', $ids)->get();
            $data = $orders->map(function ($order) {
                return [
                    'order_id' => $order->id,
                    'status' => $order->status,
                    'start_count' => $order->start_count,
                    'remains' => $order->remains,
                    'progress_percentage' => $order->progress_percentage,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        }

        $order = $apiKey->user->orders()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'order_id' => $order->id,
                'status' => $order->status,
                'start_count' => $order->start_count,
                'remains' => $order->remains,
                'progress_percentage' => $order->progress_percentage,
            ]
        ]);
    }
}
