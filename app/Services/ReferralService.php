<?php

namespace App\Services;

use App\Models\User;
use App\Models\ReferralRelationship;
use App\Models\ReferralCommission;
use Illuminate\Support\Facades\DB;

class ReferralService
{
    /**
     * Create referral relationships when a user registers with a sponsor code.
     */
    public function createReferralChain(User $newUser, string $sponsorCode)
    {
        $sponsor = User::where('sponsor_code', $sponsorCode)->first();

        if (!$sponsor) {
            return false;
        }

        // Update new user's sponsor
        $newUser->update(['sponsor_id' => $sponsor->id]);

        // Get commission rates from settings (or use defaults)
        $commissionRates = [
            1 => 10.00, // Level 1: 10%
            2 => 5.00,  // Level 2: 5%
            3 => 2.00,  // Level 3: 2%
        ];

        // Create relationships for multiple levels
        $currentSponsor = $sponsor;
        $level = 1;

        while ($currentSponsor && $level <= 3) {
            ReferralRelationship::create([
                'sponsor_id' => $currentSponsor->id,
                'referred_id' => $newUser->id,
                'level' => $level,
                'commission_percentage' => $commissionRates[$level] ?? 0,
                'status' => 'active',
            ]);

            // Move to next level
            $currentSponsor = $currentSponsor->sponsor;
            $level++;
        }

        return true;
    }

    /**
     * Award commission when a referred user makes an order.
     */
    public function awardOrderCommission(User $user, $order)
    {
        $relationships = ReferralRelationship::where('referred_id', $user->id)
            ->where('status', 'active')
            ->get();

        foreach ($relationships as $relationship) {
            $commissionAmount = ($order->sell_price * $relationship->commission_percentage) / 100;

            if ($commissionAmount > 0) {
                // Create commission record
                $commission = ReferralCommission::create([
                    'referral_relationship_id' => $relationship->id,
                    'user_id' => $relationship->sponsor_id,
                    'from_user_id' => $user->id,
                    'type' => 'order',
                    'order_id' => $order->id,
                    'amount' => $commissionAmount,
                    'percentage' => $relationship->commission_percentage,
                    'level' => $relationship->level,
                    'status' => 'approved',
                ]);

                // Update sponsor's earnings
                $sponsor = $relationship->sponsor;
                $sponsor->increment('earnings', $commissionAmount);
                $sponsor->increment('withdrawable', $commissionAmount);

                // Update relationship total
                $relationship->increment('total_earned', $commissionAmount);

                // Create notification for sponsor
                \App\Models\Notification::create([
                    'user_id' => $sponsor->id,
                    'type' => 'success',
                    'title' => 'Commission de parrainage',
                    'message' => "Vous avez gagné {$commissionAmount} XAF grâce à {$user->username}",
                    'icon' => 'gift',
                    'action_url' => '/referrals',
                    'action_label' => 'Voir mes gains',
                ]);
            }
        }
    }

    /**
     * Award commission for deposits.
     */
    public function awardDepositCommission(User $user, $transaction)
    {
        $relationships = ReferralRelationship::where('referred_id', $user->id)
            ->where('status', 'active')
            ->where('level', 1) // Only level 1 gets deposit commission
            ->get();

        foreach ($relationships as $relationship) {
            $commissionAmount = ($transaction->amount * $relationship->commission_percentage) / 100;

            if ($commissionAmount > 0) {
                ReferralCommission::create([
                    'referral_relationship_id' => $relationship->id,
                    'user_id' => $relationship->sponsor_id,
                    'from_user_id' => $user->id,
                    'type' => 'deposit',
                    'transaction_id' => $transaction->id,
                    'amount' => $commissionAmount,
                    'percentage' => $relationship->commission_percentage,
                    'level' => $relationship->level,
                    'status' => 'approved',
                ]);

                $sponsor = $relationship->sponsor;
                $sponsor->increment('earnings', $commissionAmount);
                $sponsor->increment('withdrawable', $commissionAmount);
                $relationship->increment('total_earned', $commissionAmount);
            }
        }
    }

    /**
     * Get referral statistics for a user.
     */
    public function getReferralStats(User $user)
    {
        $directReferrals = ReferralRelationship::where('sponsor_id', $user->id)
            ->where('level', 1)
            ->count();

        $totalReferrals = ReferralRelationship::where('sponsor_id', $user->id)
            ->count();

        $totalEarned = ReferralRelationship::where('sponsor_id', $user->id)
            ->sum('total_earned');

        $pendingCommissions = ReferralCommission::where('user_id', $user->id)
            ->where('status', 'pending')
            ->sum('amount');

        return [
            'direct_referrals' => $directReferrals,
            'total_referrals' => $totalReferrals,
            'total_earned' => $totalEarned,
            'pending_commissions' => $pendingCommissions,
            'sponsor_code' => $user->sponsor_code,
        ];
    }
}
