<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusUpdateMail;

class OrderManagementController extends Controller
{
    /**
     * List all orders with filters.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user:id,username', 'service:id,name']);

        // Filters - support comma-separated status values (e.g., "pending,processing")
        if ($request->has('status') && !empty($request->status)) {
            $statuses = explode(',', $request->status);
            $statuses = array_map('trim', $statuses);
            $query->whereIn('status', $statuses);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                    ->orWhere('uuid', 'like', "%{$search}%")
                    ->orWhere('link', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(50);

        return response()->json($orders);
    }

    /**
     * Get order details.
     */
    public function show($id)
    {
        $order = Order::with(['user', 'service', 'whiteLabelSite'])
            ->findOrFail($id);

        return response()->json($order);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,in_progress,completed,partial,cancelled,refunded,failed',
            'admin_notes' => 'nullable|string',
        ]);

        $order = Order::findOrFail($id);

        $order->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ]);

        if ($request->status === 'completed') {
            $order->update(['completed_at' => now()]);
        }

        // Notify User
        try {
            Mail::to($order->user->email)->queue(new OrderStatusUpdateMail($order));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send order update notification: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Statut mis à jour',
            'order' => $order,
        ]);
    }

    /**
     * Refund an order.
     */
    public function refund($id)
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'refunded') {
            return response()->json([
                'error' => 'Cette commande est déjà remboursée'
            ], 422);
        }

        return DB::transaction(function () use ($order) {
            // Refund to user
            $order->user->increment('balance', $order->sell_price);

            // Create refund transaction
            $walletMethod = \App\Models\PaymentMethod::where('code', 'wallet')->first();

            \App\Models\Transaction::create([
                'user_id' => $order->user_id,
                'payment_method_id' => $walletMethod->id,
                'type' => 'refund',
                'amount' => $order->sell_price,
                'fees' => 0,
                'net_amount' => $order->sell_price,
                'currency' => 'XAF',
                'status' => 'completed',
                'description' => "Remboursement commande #{$order->id}",
                'completed_at' => now(),
            ]);

            // Update order
            $order->update([
                'status' => 'refunded',
                'refunded_at' => now(),
            ]);

            // Create notification
            \App\Models\Notification::create([
                'user_id' => $order->user_id,
                'type' => 'info',
                'title' => 'Commande remboursée',
                'message' => "Votre commande #{$order->id} a été remboursée. {$order->sell_price} XAF ont été crédités sur votre compte.",
                'icon' => 'refund',
            ]);

            return response()->json([
                'message' => 'Commande remboursée',
                'order' => $order,
            ]);
        });
    }

    /**
     * Retry an order that failed at the provider level.
     */
    public function retry($id)
    {
        $order = Order::with(['service', 'provider'])->findOrFail($id);

        if ($order->status !== 'processing' && $order->status !== 'failed') {
            return response()->json([
                'error' => 'Seules les commandes en échec ou en traitement peuvent être relancées'
            ], 422);
        }

        $service = $order->service;
        $provider = $order->provider;

        if (!$provider) {
            return response()->json(['error' => 'Aucun fournisseur associé à ce service'], 422);
        }

        $endpoint = $provider->base_url;
        $requestBody = [
            'key' => $provider->api_key,
            'action' => 'add',
            'service' => $service->external_id,
            'link' => $order->link,
            'quantity' => $order->quantity,
        ];

        try {
            // PROACTIVE BALANCE CHECK (Consistency)
            $balanceResponse = \Illuminate\Support\Facades\Http::post($endpoint, [
                'key' => $provider->api_key,
                'action' => 'balance'
            ]);

            if ($balanceResponse->successful()) {
                $balanceData = $balanceResponse->json();
                $providerBalance = (float) ($balanceData['balance'] ?? 0);
                $rateUsdXaf = \App\Models\PlatformSetting::where('key', 'currency_rate_usd_xaf')->value('value') ?? 650;
                $costUsd = $order->cost_price / $rateUsdXaf;

                if ($providerBalance < $costUsd) {
                    return response()->json([
                        'error' => "Solde fournisseur toujours insuffisant ({$providerBalance} USD dispo, {$costUsd} USD requis)."
                    ], 422);
                }
            }

            $startTime = microtime(true);
            $response = \Illuminate\Support\Facades\Http::post($endpoint, $requestBody);
            $duration = round((microtime(true) - $startTime) * 1000);
            $apiData = $response->json();

            // Log API Call
            \App\Models\ApiLog::create([
                'user_id' => auth()->id(),
                'method' => 'POST',
                'endpoint' => $endpoint,
                'request_body' => array_merge($requestBody, ['key' => '***']),
                'response_code' => $response->status(),
                'response_body' => $apiData,
                'ip_address' => request()->ip(),
                'duration_ms' => $duration,
            ]);

            if (isset($apiData['order'])) {
                $order->update([
                    'external_order_id' => $apiData['order'],
                    'status' => 'in_progress',
                    'api_error' => null,
                    'admin_notes' => ($order->admin_notes ? $order->admin_notes . "\n" : "") . "[" . now() . "] Relancée avec succès. Nouvel ID: " . $apiData['order']
                ]);

                return response()->json([
                    'message' => 'Commande relancée avec succès',
                    'order' => $order
                ]);
            } else {
                $errorMsg = json_encode($apiData);
                $order->update([
                    'api_error' => str_contains($errorMsg, 'not_enough_funds') ? 'provider_low_balance' : $errorMsg,
                    'admin_notes' => ($order->admin_notes ? $order->admin_notes . "\n" : "") . "[" . now() . "] Échec de relance: " . $errorMsg
                ]);

                // Notify User of retry result (optional, but keep informed)
                try {
                    Mail::to($order->user->email)->queue(new OrderStatusUpdateMail($order));
                } catch (\Exception $e) {
                }

                return response()->json([
                    'error' => 'L\'API a encore retourné une erreur',
                    'details' => $apiData
                ], 400);
            }

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Exception lors de la relance: ' . $e->getMessage()
            ], 500);
        }
    }
}
