<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class WalletController extends Controller
{
    /**
     * Get wallet balance and recent activity.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $recentTransactions = $user->transactions()
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'balance' => $user->balance,
            'currency' => $user->currency,
            'recent_transactions' => $recentTransactions
        ]);
    }

    /**
     * Get paginated transactions history.
     */
    public function transactions(Request $request)
    {
        $transactions = $request->user()->transactions()
            ->latest()
            ->paginate(20);

        return response()->json($transactions);
    }

    /**
     * Get valid deposit methods.
     */
    public function depositMethods()
    {
        // Fetch active automated payment methods (exclude internal 'wallet' type for deposits)
        // Adjust logic based on your specific 'type' enum for funding methods
        // Enum: ['card', 'crypto', 'bank_transfer', 'ewallet', 'mobile_money']
        $methods = PaymentMethod::where('is_active', true)
            ->where('code', '!=', 'wallet') // Don't allow depositing via "Balance" itself
            ->orderBy('sort_order')
            ->get();

        return response()->json($methods);
    }

    /**
     * Initiate a deposit.
     */
    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'phone' => 'nullable|string',
        ]);

        $user = $request->user();
        $method = PaymentMethod::find($request->payment_method_id);

        if ($method->type === 'mobile_money' && !$request->phone) {
            throw ValidationException::withMessages([
                'phone' => ['Le numéro de téléphone est requis pour ce moyen de paiement.'],
            ]);
        }

        if (!$method->is_active) {
            throw ValidationException::withMessages([
                'payment_method_id' => ['Ce moyen de paiement est indisponible.'],
            ]);
        }

        // Check Min/Max limits
        if ($request->amount < (float) $method->min_amount) {
            throw ValidationException::withMessages([
                'amount' => ["Le montant minimum est de " . number_format((float) $method->min_amount, 0, ',', ' ') . " FCFA."],
            ]);
        }

        if ($method->max_amount && $request->amount > (float) $method->max_amount) {
            throw ValidationException::withMessages([
                'amount' => ["Le montant maximum est de " . number_format((float) $method->max_amount, 0, ',', ' ') . " FCFA."],
            ]);
        }

        // Initiate payment
        $checkoutUrl = null;
        $gatewayTransactionId = null;
        $gatewayResponse = null;

        $nelsiusService = new \App\Services\Payment\NelsiusPayService();
        $payload = [
            'amount' => $request->amount,
            'currency' => 'XAF',
            'description' => $user->username . " Deposit",
        ];

        // Determine operator and specific fields based on method type
        if ($method->type === 'mobile_money') {
            $payload['operator'] = $method->code; // orange_money or mtn_money
            $payload['phone'] = $request->phone;
        } elseif ($method->type === 'card' || $method->type === 'ewallet' || $method->type === 'global') {
            $payload['operator'] = 'global';
            $payload['email'] = $user->email;
            $payload['success_url'] = config('app.url') . '/wallet?status=success';
            $payload['cancel_url'] = config('app.url') . '/wallet?status=cancel';
        } else {
            // Default fallback or other types
            $payload['operator'] = $method->code;
        }

        $result = $nelsiusService->initiatePayment($payload);

        if (isset($result['success']) && $result['success'] === false) {
            throw ValidationException::withMessages([
                'payment' => [$result['message']],
            ]);
        }

        $gatewayResponse = $result;

        // Extract data based on response structure
        $data = $result['data'] ?? [];
        $gatewayTransactionId = $data['reference'] ?? ($data['transaction']['reference'] ?? null);

        if (isset($data['is_redirect']) && $data['is_redirect'] && isset($data['payment_url'])) {
            $checkoutUrl = $data['payment_url'];
        }

        $transaction = DB::transaction(function () use ($user, $method, $request, $gatewayTransactionId, $gatewayResponse) {
            return Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $method->id,
                'type' => 'deposit',
                'amount' => $request->amount,
                'fees' => 0,
                'net_amount' => $request->amount,
                'currency' => 'XAF',
                'status' => 'pending',
                'gateway' => 'nelsius',
                'gateway_transaction_id' => $gatewayTransactionId,
                'gateway_response' => $gatewayResponse,
                'description' => "Dépôt via {$method->name}",
                'ip_address' => $request->ip(),
                'metadata' => [
                    'phone' => $request->phone,
                ]
            ]);
        });

        return response()->json([
            'message' => $checkoutUrl ? 'Redirection vers le paiement...' : 'Transaction initiée. Veuillez valider sur votre téléphone.',
            'transaction' => $transaction,
            'checkout_url' => $checkoutUrl,
            'payment_url' => $checkoutUrl, // Frontend might look for this too
            'reference' => $gatewayTransactionId,
        ], 201);
    }

    /**
     * Check transaction status (Polling)
     */
    public function checkStatus($reference)
    {
        $transaction = Transaction::where('gateway_transaction_id', $reference)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($transaction->status !== 'pending') {
            return response()->json([
                'status' => $transaction->status,
                'message' => "Transaction déjà " . ($transaction->status === 'completed' ? 'réussie' : 'échouée'),
                'is_completed' => $transaction->status === 'completed'
            ]);
        }

        // Call Nelsius to get latest status
        $nelsiusService = new \App\Services\Payment\NelsiusPayService();
        $statusData = $nelsiusService->checkStatus($reference);

        $remoteStatus = $statusData['data']['status'] ?? ($statusData['status'] ?? null);
        $isCompleted = $statusData['data']['is_completed'] ?? ($statusData['success'] ?? false);

        if ($remoteStatus === 'completed' || $isCompleted) {
            DB::transaction(function () use ($transaction, $statusData, $reference) {
                // Double check status in case of concurrent updates
                $transaction->refresh();
                if ($transaction->status === 'pending') {
                    $transaction->update([
                        'status' => 'completed',
                        'completed_at' => now(),
                        'gateway_response' => array_merge($transaction->gateway_response ?? [], (array) $statusData),
                    ]);

                    $user = $transaction->user;
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

                    Log::info("Polling Success: User {$user->username} credited via polling. Ref: {$reference}");
                }
            });

            return response()->json([
                'status' => 'completed',
                'message' => 'Transaction réussie',
                'is_completed' => true
            ]);
        }

        return response()->json([
            'status' => $remoteStatus ?? 'pending',
            'message' => 'Transaction toujours en attente',
            'is_completed' => false
        ]);
    }
}
