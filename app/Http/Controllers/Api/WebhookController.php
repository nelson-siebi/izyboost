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

        // Extract reference from various possible formats
        $reference = $request->input('reference') ?? $request->input('data.reference');

        if (!$reference) {
            // Check if it's nested in transaction object
            $reference = $request->input('transaction.reference') ?? $request->input('data.transaction.reference');
        }

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

        // Verify status with Nelsius API for security to prevent spoofing
        $nelsiusService = new NelsiusPayService();
        $statusData = $nelsiusService->checkStatus($reference);

        $status = $statusData['data']['status'] ?? ($statusData['status'] ?? null);
        $isCompleted = $statusData['data']['is_completed'] ?? ($statusData['success'] ?? false);

        if ($status === 'completed' || $isCompleted) {
            $this->completeTransaction($transaction, $statusData);
            return response()->json(['message' => 'Transaction completed'], 200);
        }

        Log::info("Nelsius Webhook: Transaction $reference has status: $status");
        return response()->json(['message' => 'Transaction still pending or failed'], 200);
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
