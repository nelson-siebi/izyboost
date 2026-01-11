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
    /**
     * Store new plan.
     */
    public function storePlan(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:white_label_plans,slug',
            'description' => 'nullable|string',
            'monthly_price' => 'required|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'transaction_fee_percent' => 'nullable|numeric|min:0|max:100',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $plan = WhiteLabelPlan::create($request->all());

        return response()->json([
            'message' => 'Plan créé avec succès',
            'plan' => $plan,
        ], 201);
    }

    /**
     * Update plan.
     */
    public function updatePlan(Request $request, $id)
    {
        $plan = WhiteLabelPlan::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|max:100|unique:white_label_plans,slug,' . $id,
            'description' => 'nullable|string',
            'monthly_price' => 'sometimes|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'lifetime_price' => 'nullable|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            'transaction_fee_percent' => 'nullable|numeric|min:0|max:100',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer',
        ]);

        $plan->update($request->all());

        return response()->json([
            'message' => 'Plan mis à jour',
            'plan' => $plan,
        ]);
    }

    /**
     * Delete plan.
     */
    public function destroyPlan($id)
    {
        $plan = WhiteLabelPlan::findOrFail($id);

        if ($plan->sites()->exists()) {
            return response()->json(['error' => 'Impossible de supprimer ce plan car il est utilisé par des sites.'], 422);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan supprimé avec succès']);
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
        $query = Subscription::with(['user:id,username', 'site.template', 'plan']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $subscriptions = $query->latest()->paginate(50);
        return response()->json($subscriptions);
    }

    /**
     * Approve white label site.
     */
    public function approveSite(Request $request, $id)
    {
        $site = WhiteLabelSite::with('subscription', 'owner')->findOrFail($id); // Eager load owner

        if ($site->status !== 'pending') {
            return response()->json(['error' => 'Ce site n\'est pas en attente de validation.'], 422);
        }

        // Validate admin inputs
        $validated = $request->validate([
            'site_url' => 'required|url',
            'admin_url' => 'nullable|string',
            'admin_username' => 'nullable|string',
            'admin_password' => 'nullable|string',
            'send_email' => 'boolean'
        ]);

        $subscription = $site->subscription;
        if (!$subscription) {
            return response()->json(['error' => 'Aucune souscription inactive trouvée pour ce site.'], 422);
        }

        $expiresAt = null;
        if ($subscription->interval === 'monthly') {
            $expiresAt = now()->addMonth();
        } elseif ($subscription->interval === 'yearly') {
            $expiresAt = now()->addYear();
        }
        // if lifetime, remains null

        // Update Site with final URL and Status
        $site->update([
            'status' => 'active',
            'site_url' => $validated['site_url'], // Save the final validated URL
            'expires_at' => $expiresAt,
            'next_payment_at' => $expiresAt,
        ]);

        // Sync subscription
        $subscription->update([
            'status' => ($subscription->interval === 'lifetime') ? 'lifetime' : 'active',
            'starts_at' => now(),
            'ends_at' => $expiresAt,
            'next_payment_at' => $expiresAt,
        ]);

        // Send Email if requested
        if ($request->boolean('send_email') && $site->owner) {
            try {
                // Using a simple mail Notification for now. Ideally create a dedicated Mailable.
                $site->owner->notify(new \App\Notifications\WhiteLabelSiteReady(
                    $site,
                    $validated['site_url'],
                    $validated['admin_url'] ?? '/admin',
                    $validated['admin_username'] ?? 'admin',
                    $validated['admin_password'] ?? '********'
                ));
            } catch (\Exception $e) {
                // Log email error but don't fail the approval
                \Log::error('Failed to send WhiteLabel ready email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Site approuvé avec succès et email envoyé.',
            'site' => $site
        ]);
    }

    /**
     * Reject white label site.
     */
    public function rejectSite($id)
    {
        $site = WhiteLabelSite::findOrFail($id);

        if ($site->status !== 'pending') {
            return response()->json(['error' => 'Ce site n\'est pas en attente de validation.'], 422);
        }

        $site->update([
            'status' => 'cancelled',
            'notes' => $site->notes . "\n[REJECTED] " . now()->format('Y-m-d H:i'),
        ]);

        return response()->json([
            'message' => 'Demande rejetée',
            'site' => $site
        ]);
    }
}
