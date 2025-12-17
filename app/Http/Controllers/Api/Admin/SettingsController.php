<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\Request;

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
