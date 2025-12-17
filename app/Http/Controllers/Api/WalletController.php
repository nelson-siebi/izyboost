<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            'amount' => 'required|numeric|min:100', // adjust min amount as needed
            'payment_method_id' => 'required|exists:payment_methods,id',
        ]);

        $user = $request->user();
        $method = PaymentMethod::find($request->payment_method_id);

        if (!$method->is_active) {
            throw ValidationException::withMessages([
                'payment_method_id' => ['Ce moyen de paiement est indisponible.'],
            ]);
        }

        // Check Min/Max limits
        if ($request->amount < $method->min_amount) {
            throw ValidationException::withMessages([
                'amount' => ["Le montant minimum est de {$method->min_amount}."],
            ]);
        }

        if ($method->max_amount && $request->amount > $method->max_amount) {
            throw ValidationException::withMessages([
                'amount' => ["Le montant maximum est de {$method->max_amount}."],
            ]);
        }

        /* 
           Simple logic for now: Create Pending Transaction.
           In a real scenario, this would contact Stripe/Coinbase/etc 
           and return a checkout URL.
        */

        $transaction = DB::transaction(function () use ($user, $method, $request) {
            return Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $method->id,
                'type' => 'deposit',
                'amount' => $request->amount,
                'fees' => 0, // Calculate based on method fees logic if needed
                'net_amount' => $request->amount, // - fees
                'currency' => 'XAF', // Default
                'status' => 'pending',
                'description' => "Dépôt via {$method->name}",
                'ip_address' => $request->ip(),
            ]);
        });

        return response()->json([
            'message' => 'Transaction initiée',
            'transaction' => $transaction,
            'checkout_url' => null, // Would be here for Stripe/Gateway
        ], 201);
    }
}
