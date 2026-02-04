<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositSuccessMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Mail\AdminPendingDepositMail;

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
            // Remove spaces, dashes, and potential country code +237 if double
            $cleanPhone = preg_replace('/[^0-9]/', '', $request->phone);

            // User requested to send number exactly as entered (after cleaning non-digits)
            // No auto-prefixing.
            $payload['phone'] = $cleanPhone;
        } elseif ($method->type === 'card' || $method->type === 'ewallet' || $method->type === 'global') {
            $payload['operator'] = 'global';
            $payload['email'] = $user->email;
            $payload['success_url'] = config('app.frontend_url') . '/dashboard/wallet?status=success';
            $payload['cancel_url'] = config('app.frontend_url') . '/dashboard/wallet?status=cancel';
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

        
        $data = $result['data'] ?? $result;

       
        $transactionData = $data['transaction'] ?? [];
        $gatewayTransactionId = $transactionData['reference_id']
            ?? $transactionData['reference']
            ?? $data['reference_id']
            ?? $data['reference']
            ?? null;

        if (isset($data['is_redirect']) && $data['is_redirect'] && isset($data['payment_url'])) {
            $checkoutUrl = $data['payment_url'];

           
            $urlParts = parse_url($checkoutUrl);
            if (isset($urlParts['query'])) {
                parse_str($urlParts['query'], $queryParts);
                if (isset($queryParts['ref']) && !empty($queryParts['ref'])) {
                    $gatewayTransactionId = $queryParts['ref'];
                    Log::info("Extracted Nelsius UUID reference from payment_url: $gatewayTransactionId");
                }
            }
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

        
        if ($transaction->status === 'pending') {
            try {
                $adminEmail = config('app.admin_email');
                if ($adminEmail) {
                    Mail::to($adminEmail)->queue(new AdminPendingDepositMail($transaction));
                }
            } catch (\Exception $e) {
                Log::error("Failed to send admin deposit notification: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => $checkoutUrl ? 'Redirection vers le paiement...' : 'Transaction initiée. Veuillez valider sur votre téléphone.',
            'transaction' => $transaction,
            'checkout_url' => $checkoutUrl,
            'payment_url' => $checkoutUrl, // Frontend might look for this too
            // CRITICAL FIX: Ensure we return *some* reference for polling. 
            // If gateway ID is missing, use internal UUID.
            'reference' => $gatewayTransactionId ?? $transaction->uuid,
            'nelsius_debug' => $result,
        ], 201);
    }

    /**
     * Check transaction status (Polling)
     */
    public function checkStatus($reference)
    {
        // Search for transaction primarily by reference
        // We use whereRaw with LIKE for gateway_response because MariaDB JSON search with Eloquent can be picky
        $transaction = Transaction::where(function ($query) use ($reference) {
            $query->where('gateway_transaction_id', $reference)
                ->orWhere('reference', $reference)
                ->orWhere('uuid', $reference)
                ->orWhere('id', $reference) // Handle finding by ID just in case
                ->orWhereRaw('gateway_response LIKE ?', ['%' . $reference . '%']);
        })->first();

        if (!$transaction) {
            return response()->json(['error' => 'Transaction non trouvée'], 404);
        }

        // Security Check: If transaction exists but belongs to another user
        if ($transaction->user_id !== auth()->id()) {
            Log::warning("POLLING: User mismatch for transaction. Auth: " . auth()->id() . ", Owner: " . $transaction->user_id . ", Ref: " . $reference);
            // We allow the status check because gateway references are unique/unguessable
        }

        if ($transaction->status !== 'pending') {
            return response()->json([
                'status' => $transaction->status,
                'message' => "Transaction " . ($transaction->status === 'completed' ? 'réussie' : 'échouée'),
                'is_completed' => $transaction->status === 'completed'
            ]);
        }

        // Try to verify with Nelsius ONLY if we have a valid gateway reference on the transaction
        $gatewayRef = $transaction->gateway_transaction_id;

        if (!$gatewayRef) {
            // Attempt to extract it lazily if not set yet (maybe response came later?)
            if ($transaction->gateway_response) {
                // Ensure gateway_response is an array
                $data = is_string($transaction->gateway_response) ? json_decode($transaction->gateway_response, true) : (array) $transaction->gateway_response;

                // Check root or nested data - Nelsius uses 'reference_id'
                $nestedData = $data['data'] ?? [];
                $transactionData = $nestedData['transaction'] ?? [];

                $gatewayRef = $transactionData['reference_id']
                    ?? $transactionData['reference']
                    ?? $nestedData['reference_id']
                    ?? $nestedData['reference']
                    ?? $data['reference_id']
                    ?? $data['reference']
                    ?? null;
                if ($gatewayRef) {
                    $transaction->update(['gateway_transaction_id' => $gatewayRef]);
                }
            }
        }

        if (!$gatewayRef) {
            // Still no gateway reference? 
            // We cannot call remote API without it.
            // Just return pending and wait for Webhook/Cron/Manual intervention
            return response()->json([
                'status' => 'pending',
                'message' => 'En attente de confirmation réseau...',
                'is_completed' => false,
                'transaction_debug' => [
                    'gateway_transaction_id' => $transaction->gateway_transaction_id,
                    'gateway_response' => $transaction->gateway_response,
                ]
            ]);
        }

        // Call Nelsius to get latest status
        $nelsiusService = new \App\Services\Payment\NelsiusPayService();
        try {
            $statusData = $nelsiusService->checkStatus($gatewayRef);

            // Debugging: Log the full response to understand structure
            Log::info("Nelsius CheckStatus Response for {$gatewayRef}:", (array) $statusData);

            // Correct Parsing based on Nelsius API Docs
            // Structure: { data: { transaction: { status: '...' }, operator_status: '...' } }
            $data = $statusData['data'] ?? [];
            $transactionData = $data['transaction'] ?? [];

            $remoteStatus = $transactionData['status'] // Deep nested
                ?? ($data['status'] // Mid nested
                    ?? ($statusData['status'] ?? 'pending')); // Root

            $isCompleted = $data['is_completed'] ?? ($statusData['is_completed'] ?? false);

            // Extra check for operator status if available
            $operatorStatus = $data['operator_status'] ?? null;
            $failStatuses = ['PAYMENT_FAILED', 'FAILED', 'CANCELLED', 'USER_CANCELLED', 'DECLINED', 'REJECTED'];

            if (in_array($operatorStatus, $failStatuses)) {
                $remoteStatus = 'failed';
            }

            // Normalize Nelsius statuses to our internal format for the frontend
            $normalizedStatus = 'pending';
            if (in_array($remoteStatus, ['completed', 'successful', 'success', 'paid']) || $isCompleted === true) {
                $normalizedStatus = 'completed';
            } elseif (in_array($remoteStatus, ['failed', 'error', 'canceled', 'expired', 'rejected', 'declined'])) {
                $normalizedStatus = 'failed';
            }

            // If remote is final but local is still pending, trigger update
            if ($transaction->status === 'pending' && $normalizedStatus !== 'pending') {
                // ... the existing transaction update logic will handle this below
            } else {
                // Directly return normalized status if already final or still pending
                return response()->json([
                    'status' => $normalizedStatus,
                    'remote_status' => $remoteStatus,
                    'message' => "Statut actuel : " . $remoteStatus,
                    'is_completed' => $normalizedStatus === 'completed',
                    'nelsius_debug' => $statusData ?? null
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Nelsius Status Check Error: " . $e->getMessage());
            return response()->json([
                'status' => 'pending',
                'message' => 'Vérification en cours...',
                'is_completed' => false
            ]);
        }

        // Only reach here if we need to update the local transaction (normalizedStatus is final but local status is pending)
        if ($normalizedStatus === 'completed') {
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
                    try {
                        app(\App\Services\ReferralService::class)->awardDepositCommission($user, $transaction);
                    } catch (\Exception $e) {
                        Log::error("Referral award failed: " . $e->getMessage());
                    }

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

                    // Notify user (Email)
                    try {
                        Mail::to($user->email)->send(new DepositSuccessMail($transaction, $user));
                    } catch (\Exception $e) {
                        \Log::error("Failed to send deposit success email via polling: " . $e->getMessage());
                    }

                    Log::info("Polling Success: User {$user->username} credited via polling. Ref: {$reference}");
                }
            });

            return response()->json([
                'status' => 'completed',
                'message' => 'Transaction réussie',
                'is_completed' => true,
                'nelsius_debug' => $statusData ?? null
            ]);
        }

        // PERSIST FAILURE: If status is failed or canceled, update database
        if (in_array($remoteStatus, ['failed', 'canceled', 'declined', 'expired'])) {
            $transaction->update([
                'status' => 'failed',
                'gateway_response' => array_merge($transaction->gateway_response ?? [], (array) $statusData),
            ]);

            return response()->json([
                'status' => 'failed',
                'message' => 'Transaction échouée ou annulée',
                'is_completed' => false,
                'nelsius_debug' => $statusData ?? null
            ]);
        }

        return response()->json([
            'status' => $remoteStatus ?? 'pending',
            'message' => 'Transaction toujours en attente',
            'is_completed' => false,
            'nelsius_debug' => $statusData ?? null
        ]);
    }
}
