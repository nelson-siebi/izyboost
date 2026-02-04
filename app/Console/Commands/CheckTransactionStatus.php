<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Services\Payment\NelsiusPayService;
use App\Services\ReferralService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\DepositSuccessMail;

class CheckTransactionStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'transactions:check-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifier les statuts des transactions en attente via NelsiusPay';

    /**
     * Execute the console command.
     */
    public function handle(NelsiusPayService $nelsiusService, ReferralService $referralService)
    {
        $this->info("Démarrage de la vérification des transactions...");

        // Fetch pending transactions with a gateway reference, created within last 24h
        // (Avoid checking indefinitely old transactions)
        $transactions = Transaction::where('status', 'pending')
            ->whereNotNull('gateway_transaction_id')
            ->where('gateway', 'nelsius') // Only check Nelsius gateway for now
            ->where('created_at', '>=', now()->subHours(24))
            ->get();

        if ($transactions->isEmpty()) {
            $this->info("Aucune transaction en attente à vérifier.");
            return;
        }

        $this->info("Vérification de {$transactions->count()} transaction(s)...");

        foreach ($transactions as $transaction) {
            $this->checkTransaction($transaction, $nelsiusService, $referralService);
        }

        $this->info("Vérification terminée.");
    }

    protected function checkTransaction(Transaction $transaction, NelsiusPayService $service, ReferralService $referralService)
    {
        try {
            // Robust reference identification
            $reference = $transaction->gateway_transaction_id;

            // Fallback: If gateway_transaction_id is missing, try to find it in the response
            if (!$reference && $transaction->gateway_response) {
                $responseStr = json_encode($transaction->gateway_response);
                // Look for UUID-like string in the response
                if (preg_match('/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i', $responseStr, $matches)) {
                    $reference = $matches[0];
                    // Cache it for next time
                    $transaction->update(['gateway_transaction_id' => $reference]);
                }
            }

            if (!$reference) {
                $this->error("No reference found for transaction {$transaction->id}");
                return;
            }

            $this->info("Checking Ref: {$reference}");

            $statusData = $service->checkStatus($reference);

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
            if ($operatorStatus === 'PAYMENT_FAILED' || $operatorStatus === 'FAILED') {
                $remoteStatus = 'failed';
            }

            // Normalize Nelsius statuses
            $normalizedStatus = 'pending';
            if (in_array($remoteStatus, ['completed', 'successful', 'success', 'paid']) || $isCompleted === true) {
                $normalizedStatus = 'completed';
            } elseif (in_array($remoteStatus, ['failed', 'error', 'canceled', 'expired', 'rejected', 'declined'])) {
                $normalizedStatus = 'failed';
            }

            if ($normalizedStatus === 'completed') {
                DB::transaction(function () use ($transaction, $statusData, $referralService, $reference) {
                    // Double check status to avoid race conditions
                    $transaction->refresh();
                    if ($transaction->status === 'pending') {
                        $transaction->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                            'gateway_response' => array_merge($transaction->gateway_response ?? [], (array) $statusData),
                        ]);

                        $user = $transaction->user;
                        $user->increment('balance', (float) $transaction->net_amount);

                        // Award Referral Commission
                        try {
                            $referralService->awardDepositCommission($user, $transaction);
                        } catch (\Exception $e) {
                            Log::error("Referral failed for transaction {$transaction->id}: " . $e->getMessage());
                        }

                        // 1. Notify user (DB)
                        \App\Models\Notification::create([
                            'user_id' => $user->id,
                            'type' => 'success',
                            'title' => 'Recharge confirmée ✅',
                            'message' => "Votre compte a été crédité de " . number_format((float) $transaction->net_amount, 0, ',', ' ') . " FCFA.",
                            'icon' => 'wallet',
                            'data' => [
                                'transaction_id' => $transaction->id,
                                'reference' => $transaction->reference,
                                'amount' => $transaction->net_amount
                            ]
                        ]);

                        // 2. Notify user (Email)
                        try {
                            Mail::to($user->email)->send(new DepositSuccessMail($transaction, $user));
                        } catch (\Exception $e) {
                            Log::error("Failed to send deposit success email: " . $e->getMessage());
                        }

                        Log::info("Cron Success: User {$user->username} credited via cron. Ref: {$reference}");
                    }
                });

                $this->info("Transaction {$reference} validée et traitée.");
            } elseif ($normalizedStatus === 'failed') {
                $transaction->update([
                    'status' => 'failed',
                    'gateway_response' => array_merge($transaction->gateway_response ?? [], (array) $statusData),
                ]);
                $this->error("Transaction {$reference} a échoué.");
            } else {
                $this->line("Transaction {$reference} toujours en attente (Status: {$remoteStatus}).");
            }

        } catch (\Exception $e) {
            Log::error("Error checking transaction {$transaction->id}: " . $e->getMessage());
            $this->error("Erreur sur {$transaction->gateway_transaction_id}: " . $e->getMessage());
        }
    }
}
