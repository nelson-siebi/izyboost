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
            'template_id' => 'required|exists:white_label_templates,id',
            'site_name' => 'required|string|max:200',
            'subdomain' => 'required|string|max:100|unique:white_label_sites,subdomain',
            'interval' => 'required|in:monthly,yearly',
            'custom_domain' => 'boolean',
            'domain_name' => 'nullable|required_if:custom_domain,true|string|max:200',
        ]);

        $user = $request->user();
        $template = WhiteLabelTemplate::findOrFail($request->template_id);
        
        // Pricing Logic (Hardcoded as per new requirements)
        $monthlyPrice = 3000;
        $yearlyPrice = 15000;
        $customDomainFee = 8000;

        $planPrice = $request->interval === 'yearly' ? $yearlyPrice : $monthlyPrice;
        $setupFee = $request->custom_domain ? $customDomainFee : 0;
        
        $totalAmount = $planPrice + $setupFee;

        // Check user balance
        if ($user->balance < $totalAmount) {
            throw ValidationException::withMessages([
                'balance' => ['Solde insuffisant. Il vous faut ' . number_format($totalAmount, 0, ',', ' ') . ' FCFA.'],
            ]);
        }
        
        // Use a default plan ID for database consistency (assuming ID 1 exists, otherwise we should fetch first)
        $plan = WhiteLabelPlan::first(); 

        return DB::transaction(function () use ($user, $template, $plan, $request, $planPrice, $setupFee, $totalAmount) {
            
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

            // Create transaction
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'payment_method_id' => $walletMethod->id,
                'type' => 'site_purchase',
                'amount' => $totalAmount,
                'fees' => 0,
                'net_amount' => $totalAmount,
                'currency' => 'XAF',
                'status' => 'completed',
                'description' => "Achat site White Label - {$plan->name}",
                'completed_at' => now(),
            ]);

            // Create site order
            $siteOrder = SiteOrder::create([
                'user_id' => $user->id,
                'template_id' => $template->id,
                'plan_id' => $plan->id,
                'transaction_id' => $transaction->id,
                'type' => 'new_purchase',
                'amount' => $planPrice,
                'setup_fee' => $setupFee,
                'total_amount' => $totalAmount,
                'currency' => 'XAF',
                'status' => 'completed',
                'deployment_type' => $request->deployment_type,
                'deployed_at' => now(),
                'completed_at' => now(),
            ]);

            // Create the white label site
            $subdomain = Str::slug($request->subdomain);
            // If custom domain is purchased, we might set it as site_url or keep subdomain as primary for now
            // For this implementation, we'll store request->domain_name if custom_domain is true
            $finalDomain = $request->custom_domain ? $request->domain_name : "{$subdomain}.izyboost.com";
            $siteUrl = "https://{$finalDomain}";

            $site = WhiteLabelSite::create([
                'owner_id' => $user->id,
                'template_id' => $template->id,
                'plan_id' => $plan->id,
                'site_name' => $request->site_name,
                'site_url' => $siteUrl,
                'subdomain' => $subdomain,
                'custom_domain' => $request->custom_domain ? $request->domain_name : null,
                'status' => 'pending', // Set to pending for admin review of domain/setup
                'deployment_type' => 'hosted_by_us',
                'branding' => [
                    'logo' => null,
                    'colors' => [
                        'primary' => '#3B82F6',
                        'secondary' => '#10B981',
                    ],
                    'favicon' => null,
                    'site_name' => $request->site_name,
                ],
                'configuration' => [
                    'language' => 'fr',
                    'currency' => 'XAF',
                    'timezone' => 'Africa/Douala',
                ],
                'allowed_services' => null, // null = all services
                'price_multiplier' => 1.00,
                'margin_percent' => 20.00,
                'statistics' => [
                    'total_orders' => 0,
                    'total_revenue' => 0,
                    'active_users' => 0,
                ],
                'last_payment_at' => now(),
                'next_payment_at' => $request->interval === 'yearly' 
                    ? now()->addYear() 
                    : now()->addMonth(),
                'expires_at' => $request->interval === 'yearly' 
                    ? now()->addYear() 
                    : now()->addMonth(),
            ]);

            // Create subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'white_label_site_id' => $site->id,
                'plan_id' => $plan->id,
                'template_id' => $template->id,
                'status' => 'active',
                'amount' => $planPrice,
                'currency' => 'XAF',
                'interval' => $request->interval,
                'starts_at' => now(),
                'ends_at' => $request->interval === 'yearly' 
                    ? now()->addYear() 
                    : now()->addMonth(),
            ]);

            return response()->json([
                'message' => 'Site créé avec succès !',
                'site' => [
                    'uuid' => $site->uuid,
                    'site_name' => $site->site_name,
                    'site_url' => $site->site_url,
                    'status' => $site->status,
                ],
                'subscription' => [
                    'uuid' => $subscription->uuid,
                    'plan' => $plan->name,
                    'interval' => $subscription->interval,
                    'next_payment' => $site->next_payment_at,
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
