<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhiteLabelSite;
use App\Models\WhiteLabelPlan;
use App\Models\WhiteLabelTemplate;
use App\Models\Subscription;
use Illuminate\Http\Request;

class WhiteLabelController extends Controller
{
    /**
     * List all white label sites.
     */
    public function sites(Request $request)
    {
        $query = WhiteLabelSite::with(['owner:id,username', 'plan', 'template']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('owner_id')) {
            $query->where('owner_id', $request->owner_id);
        }

        $sites = $query->latest()->paginate(50);
        return response()->json($sites);
    }

    /**
     * Get site details.
     */
    public function showSite($id)
    {
        $site = WhiteLabelSite::with(['owner', 'plan', 'template', 'subscription'])
            ->findOrFail($id);

        return response()->json($site);
    }

    /**
     * Suspend/Activate site.
     */
    public function toggleSiteStatus($id)
    {
        $site = WhiteLabelSite::findOrFail($id);

        if ($site->status === 'active') {
            $site->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);
            $message = 'Site suspendu';
        } else {
            $site->update([
                'status' => 'active',
                'suspended_at' => null,
            ]);
            $message = 'Site activé';
        }

        return response()->json([
            'message' => $message,
            'site' => $site,
        ]);
    }

    /**
     * List plans.
     */
    public function plans()
    {
        $plans = WhiteLabelPlan::withCount('sites')->get();
        return response()->json($plans);
    }

    /**
     * Update plan.
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = WhiteLabelPlan::findOrFail($id);

        $request->validate([
            'monthly_price' => 'sometimes|numeric',
            'yearly_price' => 'sometimes|numeric',
            'is_active' => 'sometimes|boolean',
        ]);

        $plan->update($request->only([
            'monthly_price',
            'yearly_price',
            'is_active',
        ]));

        return response()->json([
            'message' => 'Plan mis à jour',
            'plan' => $plan,
        ]);
    }

    /**
     * List templates.
     */
    public function templates()
    {
        $templates = WhiteLabelTemplate::all();
        return response()->json($templates);
    }

    /**
     * List subscriptions.
     */
    public function subscriptions(Request $request)
    {
        $query = Subscription::with(['user:id,username', 'site', 'plan']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->latest()->paginate(50);
        return response()->json($subscriptions);
    }
}
