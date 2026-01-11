<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckSiteExpirations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sites:check-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for expired white label site subscriptions and renew or suspend them.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Checking subscription expirations...');

        // Get active subscriptions that have expired (and aren't lifetime)
        $subscriptions = Subscription::with(['user', 'site', 'plan'])
            ->where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<=', now())
            ->get();

        $count = $subscriptions->count();
        $this->info("Found {$count} expired subscriptions.");

        foreach ($subscriptions as $subscription) {
            $this->processSubscription($subscription);
        }

        $this->info('Done.');
        return 0;
    }

    protected function processSubscription($subscription)
    {
        $user = $subscription->user;
        $amount = $subscription->amount;

        if (!$user || !$subscription->site) {
            $this->error("Subscription {$subscription->id} has missing user or site.");
            return;
        }

        // Try to renew
        if ($user->balance >= $amount) {
            try {
                DB::transaction(function () use ($user, $subscription, $amount) {
                    // Deduct balance
                    $user->decrement('balance', $amount);

                    // Create transaction
                    Transaction::create([
                        'uuid' => (string) Str::uuid(),
                        'user_id' => $user->id,
                        'payment_method_id' => null, // Internal wallet
                        'type' => 'payment',
                        'sub_type' => 'subscription_renewal',
                        'amount' => $amount,
                        'fees' => 0,
                        'net_amount' => $amount,
                        'currency' => 'XAF',
                        'status' => 'completed',
                        'description' => "Renouvellement automatique abonnement " . ($subscription->plan ? $subscription->plan->name : 'Unknown') . " ({$subscription->interval})",
                        'completed_at' => now(),
                        'verified_at' => now(),
                    ]);

                    // Update dates
                    $newExpiry = $subscription->interval === 'monthly' ? now()->addMonth() : now()->addYear();

                    $subscription->update([
                        'ends_at' => $newExpiry,
                        'next_payment_at' => $newExpiry,
                    ]);

                    $subscription->site->update([
                        'expires_at' => $newExpiry,
                        'next_payment_at' => $newExpiry,
                        'last_payment_at' => now(),
                        'status' => 'active'
                    ]);

                    $this->info("Subscription {$subscription->id} renewed for user {$user->username}.");
                });
            } catch (\Exception $e) {
                $this->error("Failed to renew subscription {$subscription->id}: " . $e->getMessage());
            }
        } else {
            // Suspend
            try {
                DB::transaction(function () use ($subscription) {
                    $subscription->update(['status' => 'past_due']);

                    $subscription->site->update([
                        'status' => 'suspended',
                        'suspended_at' => now(),
                        'notes' => $subscription->site->notes . "\n[SUSPENDED] Solde insuffisant pour renouvellement le " . now()->format('Y-m-d H:i')
                    ]);
                });
                $this->warn("Subscription {$subscription->id} suspended (insufficient funds).");
            } catch (\Exception $e) {
                $this->error("Failed to suspend subscription {$subscription->id}: " . $e->getMessage());
            }
        }
    }
}
