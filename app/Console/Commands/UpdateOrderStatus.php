<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Order;
use App\Models\ApiProvider;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateOrderStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'smm:update-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch order status updates from external SMM provider API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Get Pending/Processing/In Progress Orders with External ID
        $orders = Order::whereIn('status', ['pending', 'processing', 'in_progress'])
            ->whereNotNull('external_order_id')
            ->whereNotNull('external_provider_id')
            ->get();

        if ($orders->isEmpty()) {
            $this->info("No orders to update.");
            return;
        }

        $this->info("Found " . $orders->count() . " orders to check.");

        // Group orders by provider to avoid redundant API calls or handle different credentials
        $groupedOrders = $orders->groupBy('external_provider_id');

        foreach ($groupedOrders as $providerId => $providerOrders) {
            $provider = ApiProvider::find($providerId);
            if (!$provider) {
                $this->error("Provider ID {$providerId} not found.");
                continue;
            }

            $this->info("Updating orders for provider: " . $provider->name);

            foreach ($providerOrders as $order) {
                $this->updateSingleOrder($order, $provider);
            }
        }

        $this->info("Finished status update sync.");
    }

    /**
     * Update status for a specific order.
     */
    private function updateSingleOrder(Order $order, ApiProvider $provider)
    {
        try {
            $response = Http::post($provider->base_url, [
                'key' => $provider->api_key,
                'action' => 'status',
                'order' => $order->external_order_id
            ]);

            if ($response->failed()) {
                $this->error("API call failed for Order #{$order->id}: " . $response->body());
                return;
            }

            $data = $response->json();

            if (isset($data['error'])) {
                $this->error("API Error for Order #{$order->id}: " . $data['error']);
                return;
            }

            $externalStatus = strtolower($data['status'] ?? '');

            if (!$externalStatus) {
                $this->warn("No status found in response for Order #{$order->id}");
                return;
            }

            // Map Statuses
            $internalStatus = $this->mapStatus($externalStatus);

            if ($internalStatus === $order->status) {
                $this->info("Order #{$order->id} status unchanged: {$internalStatus}");
                return;
            }

            // Perform Update
            DB::transaction(function () use ($order, $internalStatus, $externalStatus, $data) {
                $order->status = $internalStatus;

                // Optional: Store remains or start_count if provided
                if (isset($data['remains']))
                    $order->remains = $data['remains'];
                if (isset($data['start_count']))
                    $order->start_count = $data['start_count'];

                $order->save();

                // Handle Refunds if status is Canceled/Refunded
                if (in_array($externalStatus, ['canceled', 'refunded', 'cancelled'])) {
                    $this->handleRefund($order);
                }
            });

            $this->info("Order #{$order->id} updated: {$order->status} (External: {$externalStatus})");

        } catch (\Exception $e) {
            $this->error("Exception updating Order #{$order->id}: " . $e->getMessage());
        }
    }

    /**
     * Map external API statuses to internal database statuses.
     */
    private function mapStatus($status)
    {
        $status = strtolower($status);

        return match ($status) {
            'pending' => 'pending',
            'inprogress', 'processing' => 'processing',
            'completed', 'partial' => 'completed',
            'canceled', 'cancelled', 'refunded' => 'cancelled',
            default => 'pending',
        };
    }

    /**
     * Handle user refund if order is canceled.
     */
    private function handleRefund(Order $order)
    {
        $user = User::find($order->user_id);
        if (!$user)
            return;

        $refundAmount = $order->sell_price; // Full refund

        // Ensure we don't refund twice (idempotency check would be better with a Transaction entry)
        // Check if there's already a refund transaction for this order
        $exists = \App\Models\Transaction::where('user_id', $user->id)
            ->where('type', 'refund')
            ->where('metadata->order_id', $order->id)
            ->exists();

        if ($exists) {
            $this->warn("Refund already processed for Order #{$order->id}");
            return;
        }

        $user->increment('balance', $refundAmount);

        // Record Transaction
        \App\Models\Transaction::create([
            'user_id' => $user->id,
            'type' => 'refund',
            'amount' => $refundAmount,
            'net_amount' => $refundAmount,
            'currency' => $order->currency ?? 'XAF',
            'status' => 'completed',
            'description' => "Remboursement commande #{$order->id} annullée",
            'metadata' => ['order_id' => $order->id],
        ]);

        $this->info("Refunded {$refundAmount} to User #{$user->id} for Order #{$order->id}");
    }
}
