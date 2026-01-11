<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderStatusUpdateMail;

class FinancialController extends Controller
{
    /**
     * Get financial statistics.
     */
    public function stats(Request $request)
    {
        $period = $request->input('period', 'month'); // day, week, month, year

        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        $deposits = Transaction::where('type', 'deposit')
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('net_amount');

        $withdrawals = Transaction::where('type', 'withdrawal')
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('net_amount');

        $orderPayments = Transaction::where('type', 'order_payment')
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('net_amount');

        $commissions = Transaction::where('type', 'commission')
            ->where('status', 'completed')
            ->where('created_at', '>=', $startDate)
            ->sum('net_amount');

        $platformBalance = \App\Models\User::sum('balance');
        $totalEarnings = \App\Models\User::sum('earnings');

        return response()->json([
            'period' => $period,
            'deposits' => $deposits,
            'withdrawals' => $withdrawals,
            'order_payments' => $orderPayments,
            'commissions_paid' => $commissions,
            'net_revenue' => $deposits - $withdrawals,
            'platform_balance' => $platformBalance,
            'total_earnings' => $totalEarnings,
        ]);
    }

    /**
     * List all transactions.
     */
    public function transactions(Request $request)
    {
        $query = Transaction::with(['user:id,username', 'paymentMethod:id,name']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->latest()->paginate(50);

        return response()->json($transactions);
    }

    /**
     * Verify a pending transaction.
     */
    public function verifyTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'error' => 'Seules les transactions en attente peuvent être vérifiées'
            ], 422);
        }

        return DB::transaction(function () use ($transaction, $request) {
            $transaction->update([
                'status' => 'completed',
                'verified_by' => $request->user()->id,
                'verified_at' => now(),
                'completed_at' => now(),
            ]);

            // Credit user if deposit
            if ($transaction->type === 'deposit') {
                $transaction->user->increment('balance', (float) $transaction->net_amount);
            }

            // Notification User (TODO: Create TransactionMail if needed)

            return response()->json([
                'message' => 'Transaction vérifiée et complétée',
                'transaction' => $transaction,
            ]);
        });
    }

    /**
     * Reject a pending transaction (e.g. proof invalid).
     */
    public function rejectTransaction(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json([
                'error' => 'Seules les transactions en attente peuvent être rejetées'
            ], 422);
        }

        $transaction->update([
            'status' => 'failed',
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'admin_notes' => $request->input('reason', 'Transaction rejetée par l\'administrateur'),
        ]);

        return response()->json([
            'message' => 'Transaction rejetée',
            'transaction' => $transaction,
        ]);
    }

    /**
     * Manage payment methods.
     */
    public function paymentMethods(Request $request)
    {
        $methods = PaymentMethod::orderBy('sort_order')->get();
        return response()->json($methods);
    }

    /**
     * Update payment method.
     */
    public function updatePaymentMethod(Request $request, $id)
    {
        $method = PaymentMethod::findOrFail($id);

        $request->validate([
            'is_active' => 'sometimes|boolean',
            'min_amount' => 'sometimes|numeric',
            'max_amount' => 'sometimes|numeric',
        ]);

        $method->update($request->only(['is_active', 'min_amount', 'max_amount']));

        return response()->json([
            'message' => 'Méthode de paiement mise à jour',
            'method' => $method,
        ]);
    }
}
