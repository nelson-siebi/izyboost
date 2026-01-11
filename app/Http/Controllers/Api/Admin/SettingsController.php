<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SettingsController extends Controller
{
    /**
     * Get all settings.
     */
    public function index(Request $request)
    {
        $query = PlatformSetting::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->get()->map(function ($setting) {
            return [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->typed_value,
                'type' => $setting->type,
                'category' => $setting->category,
                'group' => $setting->group,
                'is_public' => $setting->is_public,
                'editable' => $setting->editable,
            ];
        });

        return response()->json($settings);
    }

    /**
     * Get only public settings.
     */
    public function publicIndex()
    {
        $settings = PlatformSetting::where('is_public', true)->get()->map(function ($setting) {
            return [
                'key' => $setting->key,
                'value' => $setting->typed_value,
            ];
        });

        return response()->json($settings);
    }

    /**
     * Bulk update settings.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        $updated = [];
        $settings = $request->input('settings'); // Expecting ['key' => 'value', ...]

        foreach ($settings as $key => $value) {
            $normalizedValue = (is_array($value) || is_object($value)) ? json_encode($value) : $value;

            $setting = PlatformSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $normalizedValue]
            );

            if ($setting) {
                $updated[] = $key;

                // SPECIAL TRIGGER: If default_user_margin is changed, update ALL service prices immediately
                if ($key === 'default_user_margin') {
                    $newMargin = (float) $normalizedValue;
                    \App\Models\Service::query()->each(function ($service) use ($newMargin) {
                        $service->update([
                            'base_price_per_unit' => $service->cost_per_unit * (1 + ($newMargin / 100))
                        ]);
                    });
                }
            }
        }

        return response()->json([
            'message' => count($updated) . ' paramètres mis à jour avec succès',
            'updated_keys' => $updated
        ]);
    }

    /**
     * Update setting.
     */
    public function update(Request $request, $key)
    {
        $setting = PlatformSetting::where('key', $key)->firstOrFail();

        if (!$setting->editable) {
            return response()->json([
                'error' => 'Ce paramètre n\'est pas modifiable'
            ], 403);
        }

        $request->validate([
            'value' => 'required',
        ]);

        $value = $request->value;

        // Convert value based on type
        if ($setting->type === 'json' || $setting->type === 'array') {
            $value = json_encode($value);
        }

        $setting->update(['value' => $value]);

        return response()->json([
            'message' => 'Paramètre mis à jour',
            'setting' => [
                'key' => $setting->key,
                'value' => $setting->typed_value,
            ],
        ]);
    }

    /**
     * Upload site logo.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $path = $file->storeAs('settings', 'logo.' . $file->getClientOriginalExtension(), 'public');
            // Store relative path to avoid APP_URL issues
            $relativeUrl = '/storage/' . $path;

            PlatformSetting::updateOrCreate(
                ['key' => 'site_logo'],
                [
                    'value' => $relativeUrl,
                    'type' => 'string',
                    'category' => 'general',
                    'group' => 'branding',
                    'is_public' => true,
                    'editable' => true,
                ]
            );

            return response()->json([
                'message' => 'Logo mis à jour avec succès',
                'url' => $relativeUrl
            ]);
        }

        return response()->json(['error' => 'Aucun fichier reçu'], 400);
    }

    /**
     * Get platform statistics.
     */
    public function platformStats()
    {
        $stats = [
            'total_users' => \App\Models\User::count(),
            'total_orders' => \App\Models\Order::count(),
            'total_revenue' => \App\Models\Transaction::where('type', 'deposit')
                ->where('status', 'completed')
                ->sum('net_amount'),
            'total_sites' => \App\Models\WhiteLabelSite::count(),
            'total_services' => \App\Models\Service::count(),
            'active_tickets' => \App\Models\Ticket::whereIn('status', ['open', 'pending', 'in_progress'])->count(),
        ];

        return response()->json($stats);
    }
}
