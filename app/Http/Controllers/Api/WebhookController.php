<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Payment\NelsiusPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle Nelsius Pay Webhook
     */
    public function nelsius(Request $request)
    {
        Log::info('Nelsius Webhook Received', $request->all());

        // Extract event type
        $event = $request->input('event');

        // Extract reference_id from Nelsius webhook payload
        $data = $request->input('data', []);
        $reference = $data['reference_id']
            ?? $data['reference']
            ?? $request->input('reference_id')
            ?? $request->input('reference')
            ?? null;

        if (!$reference) {
            Log::warning('Nelsius Webhook: Reference missing in payload');
            return response()->json(['message' => 'Reference missing'], 400);
        }

        $transaction = Transaction::where('gateway_transaction_id', $reference)
            ->where('status', 'pending')
            ->first();

        if (!$transaction) {
            Log::info("Nelsius Webhook: Transaction $reference not found or already processed");
            return response()->json(['message' => 'Transaction not found or already processed'], 200);
        }

        // Handle different event types
        if ($event === 'payment.completed' || $event === 'payment.success') {
            // Verify status with Nelsius API for security
            $nelsiusService = new NelsiusPayService();
            try {
                $statusData = $nelsiusService->checkStatus($reference);

                // Parse status from actual Nelsius structure
                $nestedData = $statusData['data'] ?? [];
                $transactionData = $nestedData['transaction'] ?? [];
                $status = $transactionData['status'] ?? $nestedData['status'] ?? $statusData['status'] ?? null;

                if ($status === 'completed' || $status === 'successful' || $status === 'success') {
                    $this->completeTransaction($transaction, $statusData);
                    return response()->json(['message' => 'Transaction completed'], 200);
                }
            } catch (\Exception $e) {
                Log::error("Nelsius Webhook: Failed to verify transaction: " . $e->getMessage());
            }
        } elseif ($event === 'payment.failed' || $event === 'payment.cancelled') {
            // Mark transaction as failed
            $transaction->update([
                'status' => 'failed',
                'gateway_response' => array_merge($transaction->gateway_response ?? [], $request->all()),
            ]);

            Log::info("Nelsius Webhook: Transaction $reference marked as failed");
            return response()->json(['message' => 'Transaction marked as failed'], 200);
        }

        Log::info("Nelsius Webhook: Transaction $reference event '$event' received");
        return response()->json(['message' => 'Webhook received'], 200);
    }

    /**
     * Complete the transaction and credit user balance
     */
    protected function completeTransaction($transaction, $gatewayResponse)
    {
        DB::transaction(function () use ($transaction, $gatewayResponse) {
            $transaction->update([
                'status' => 'completed',
                'completed_at' => now(),
                'gateway_response' => array_merge($transaction->gateway_response ?? [], (array) $gatewayResponse),
            ]);

            $user = $transaction->user;
            // Use net_amount to handle any fees
            $user->increment('balance', (float) $transaction->net_amount);

            // 5. Award Referral Commission (Deposit)
            app(\App\Services\ReferralService::class)->awardDepositCommission($user, $transaction);

            // Notify user
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'type' => 'success',
                'title' => 'Recharge réussie ✅',
                'message' => "Votre compte a été crédité de " . number_format((float) $transaction->net_amount, 0, ',', ' ') . " FCFA via {$transaction->paymentMethod->name}.",
                'icon' => 'wallet',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'reference' => $transaction->gateway_transaction_id,
                    'amount' => $transaction->net_amount
                ]
            ]);

            Log::info("Deposit Success: User {$user->username} credited with {$transaction->net_amount} XAF. Transaction ID: {$transaction->id}");
        });
    }
}
