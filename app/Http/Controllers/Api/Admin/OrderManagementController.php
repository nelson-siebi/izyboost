<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderManagementController extends Controller
{
    /**
     * List all orders with filters.
     */
    public function index(Request $request)
    {
        $query = Order::with(['user:id,username', 'service:id,name']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
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
}
