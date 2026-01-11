<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhiteLabelSite;
use App\Models\WhiteLabelPlan;
use App\Models\WhiteLabelTemplate;
use App\Models\SiteOrder;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;

class SiteController extends Controller
{
    /**
     * Purchase a new white label site.
     */
    public function purchase(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:white_label_plans,id',
            'template_id' => 'required|exists:white_label_templates,id',
            'site_name' => 'required|string|max:200',
            'subdomain' => 'required|string|max:100|unique:white_label_sites,subdomain',
            'interval' => 'required|in:monthly,yearly,lifetime',
            'custom_domain' => 'boolean',
            'domain_name' => 'nullable|required_if:custom_domain,true|string|max:200',
        ]);

        $user = $request->user();
        $plan = WhiteLabelPlan::findOrFail($request->plan_id);
        $template = WhiteLabelTemplate::findOrFail($request->template_id);

        // Determine Price and Duration
        $planPrice = 0;
        $expiryDate = null;

        switch ($request->interval) {
            case 'monthly':
                $planPrice = $plan->monthly_price;
                $expiryDate = now()->addMonth();
                break;
            case 'yearly':
                $planPrice = $plan->yearly_price;
                $expiryDate = now()->addYear();
                break;
            case 'lifetime':
                if (!$plan->lifetime_price) {
                    throw ValidationException::withMessages([
                        'interval' => ['Ce plan ne propose pas l\'option à vie.'],
                    ]);
                }
                $planPrice = $plan->lifetime_price;
                $expiryDate = null; // No expiration
                break;
        }

        // Setup Fee (Only if plan has one, currently logic was custom_domain for free setup plans, we will stick to Plan setup_fee + optional custom domain fee if needed. For now keeping it simple: Plan Price + Plan Setup Fee)
        // Note: Previous logic had a hardcoded $8000 fee for custom domain. We should probably keep that or move it to settings. Let's keep it as a constant for now or 0 if included in higher plans.
        // Better attempt: Check if plan is 'pro' or 'agency' (high tier) -> free custom domain.

        $customDomainFee = 0;
        if ($request->custom_domain) {
            // If plan doesn't include free domain (e.g. Starter), charge fee. 
            // Simplification: We blindly charge if logic dictates, but relying on Plan Features is better.
            // For now, let's assume the Plan Price ALREADY accounts for features level. 
            // We will just add the Plan's defined setup_fee.
            $customDomainFee = 0; // Removing hardcoded fee, assuming Plan structure covers it.
        }

        $totalAmount = $planPrice + ($plan->setup_fee ?? 0);

        // Check user balance
        if ($user->balance < $totalAmount) {
            throw ValidationException::withMessages([
                'balance' => ['Solde insuffisant. Il vous faut ' . number_format($totalAmount, 0, ',', ' ') . ' FCFA.'],
            ]);
        }

        return DB::transaction(function () use ($user, $template, $plan, $request, $planPrice, $totalAmount, $expiryDate) {

            // Deduct balance
            $user->decrement('balance', $totalAmount);

            // Get wallet payment method
            $walletMethod = PaymentMethod::firstOrCreate(
                ['code' => 'wallet'],
                [
                    'name' => 'Solde Principal',
                    'type' => 'ewallet',
                    'is_active' => true,
                    'min_amount' => 0,
                    'max_amount' => 10000000,
                    'currencies' => ['XAF', 'EUR', 'USD'],
                    'config' => [],
                ]
            );

            // Create transaction ("Achat site" or "Achat plan")
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $walletMethod->id,
                'type' => 'site_purchase',
                'amount' => $totalAmount,
                'fees' => 0,
                'net_amount' => $totalAmount,
                'currency' => 'XAF',
                'status' => 'completed',
                'description' => "Achat site White Label - Plan {$plan->name} ({$request->interval})",
                'completed_at' => now(),
            ]);

            // Create site order
            $order = SiteOrder::create([
                'user_id' => $user->id,
                'template_id' => $template->id,
                'plan_id' => $plan->id,
                'transaction_id' => $transaction->id,
                'type' => 'new_purchase',
                'amount' => $planPrice,
                'setup_fee' => $plan->setup_fee,
                'total_amount' => $totalAmount,
                'currency' => 'XAF',
                'status' => 'completed',
                'deployment_type' => $request->deployment_type ?? 'automated', // Default
                'deployed_at' => now(),
                'completed_at' => now(),
            ]);

            // Create the white label site
            $subdomain = Str::slug($request->subdomain);
            $siteUrl = "https://{$subdomain}.izyboost.com";

            if ($request->custom_domain && $request->domain_name) {
                // Keep subdomain for system access, but site_url could be custom
                // Usually we start with subdomain, and custom domain is an alias added later or verified.
            }

            $site = WhiteLabelSite::create([
                'owner_id' => $user->id,
                'template_id' => $template->id,
                'plan_id' => $plan->id,
                'site_name' => $request->site_name,
                'site_url' => $siteUrl,
                'subdomain' => $subdomain,
                'custom_domain' => $request->custom_domain ? $request->domain_name : null,
                'status' => 'pending', // Validation required
                'deployment_type' => 'hosted_by_us',
                'branding' => [
                    'logo' => null,
                    'colors' => [
                        'primary' => '#3B82F6',
                        'secondary' => '#10B981',
                    ],
                    'site_name' => $request->site_name,
                ],
                'configuration' => [
                    'language' => 'fr',
                    'currency' => 'XAF',
                    'timezone' => 'Africa/Douala',
                ],
                'price_multiplier' => 1.00,
                'margin_percent' => 20.00,
                'statistics' => [
                    'total_orders' => 0,
                    'total_revenue' => 0,
                ],
                'last_payment_at' => now(),
                'next_payment_at' => $expiryDate,
                'expires_at' => $expiryDate,
            ]);

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'white_label_site_id' => $site->id,
                'plan_id' => $plan->id,
                'template_id' => $template->id,
                'status' => 'pending',
                'amount' => $planPrice,
                'currency' => 'XAF',
                'interval' => $request->interval,
                'starts_at' => now(),
                'ends_at' => $expiryDate,
            ]);

            // Notify Admin
            try {
                $adminEmail = config('app.admin_email');
                if ($adminEmail) {
                    \Illuminate\Support\Facades\Notification::route('mail', $adminEmail)
                        ->notify(new \App\Notifications\NewWhiteLabelPurchase($site, $order));
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to notify admin on purchase: " . $e->getMessage());
            }

            // Notify User (Welcome/Purchase Confirmation)
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeEmail($user));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send welcome email to {$user->email}: " . $e->getMessage());
            }

            return response()->json([
                'message' => 'Site commandé avec succès ! Attente de validation.',
                'site' => [
                    'uuid' => $site->uuid,
                    'site_name' => $site->site_name,
                    'status' => $site->status,
                ],
                'subscription' => [
                    'plan' => $plan->name,
                    'interval' => $subscription->interval,
                ],
                'balance_after' => $user->fresh()->balance,
            ], 201);
        });
    }

    /**
     * Get user's white label sites.
     */
    public function index(Request $request)
    {
        $sites = $request->user()->whiteLabelSites()
            ->with(['template', 'plan', 'subscription'])
            ->latest()
            ->get();

        return response()->json($sites);
    }

    /**
     * Get site details.
     */
    public function show(Request $request, $uuid)
    {
        $site = $request->user()->whiteLabelSites()
            ->with(['template', 'plan', 'subscription'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        return response()->json($site);
    }

    /**
     * Update site branding.
     */
    public function updateBranding(Request $request, $uuid)
    {
        $request->validate([
            'logo' => 'nullable|url',
            'colors.primary' => 'nullable|string',
            'colors.secondary' => 'nullable|string',
            'site_name' => 'nullable|string|max:200',
        ]);

        $site = $request->user()->whiteLabelSites()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $branding = $site->branding;

        if ($request->has('logo')) {
            $branding['logo'] = $request->logo;
        }

        if ($request->has('colors')) {
            $branding['colors'] = array_merge($branding['colors'] ?? [], $request->colors);
        }

        if ($request->has('site_name')) {
            $branding['site_name'] = $request->site_name;
        }

        $site->update(['branding' => $branding]);

        return response()->json([
            'message' => 'Branding mis à jour',
            'branding' => $site->branding,
        ]);
    }

    /**
     * Update site pricing.
     */
    public function updatePricing(Request $request, $uuid)
    {
        $request->validate([
            'margin_percent' => 'required|numeric|min:0|max:100',
        ]);

        $site = $request->user()->whiteLabelSites()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $site->update([
            'margin_percent' => $request->margin_percent,
            'price_multiplier' => 1 + ($request->margin_percent / 100),
        ]);

        return response()->json([
            'message' => 'Tarification mise à jour',
            'margin_percent' => $site->margin_percent,
            'price_multiplier' => $site->price_multiplier,
        ]);
    }
}
