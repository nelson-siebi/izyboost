<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReferralService;
use App\Models\ReferralRelationship;
use App\Models\ReferralCommission;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    protected $referralService;

    public function __construct(ReferralService $referralService)
    {
        $this->referralService = $referralService;
    }

    /**
     * Get referral statistics.
     */
    public function stats(Request $request)
    {
        $stats = $this->referralService->getReferralStats($request->user());

        return response()->json($stats);
    }

    /**
     * Get list of referrals.
     */
    public function referrals(Request $request)
    {
        $referrals = ReferralRelationship::where('sponsor_id', $request->user()->id)
            ->with(['referred:id,username,email,created_at'])
            ->orderBy('level')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($referrals);
    }

    /**
     * Get commission history.
     */
    public function commissions(Request $request)
    {
        $commissions = ReferralCommission::where('user_id', $request->user()->id)
            ->with(['fromUser:id,username', 'order:id,uuid'])
            ->latest()
            ->paginate(50);

        return response()->json($commissions);
    }

    /**
     * Get referral link.
     */
    public function link(Request $request)
    {
        $user = $request->user();
        $baseUrl = config('app.frontend_url');
        if (!$baseUrl) {
            // Fallback to app.url but ensure it's not localhost in production
            $baseUrl = config('app.url');
        }
        $referralLink = rtrim($baseUrl, '/') . "/auth/register?ref={$user->sponsor_code}";

        return response()->json([
            'sponsor_code' => $user->sponsor_code,
            'referral_link' => $referralLink,
        ]);
    }
}
