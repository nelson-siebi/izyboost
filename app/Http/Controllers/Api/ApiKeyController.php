<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class ApiKeyController extends Controller
{
    /**
     * List user's API keys.
     */
    public function index(Request $request)
    {
        $keys = $request->user()->apiKeys()
            ->latest()
            ->get()
            ->map(function ($key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'key' => $key->key,
                    'type' => $key->type,
                    'permissions' => $key->permissions,
                    'rate_limit' => $key->rate_limit,
                    'daily_requests' => $key->daily_requests,
                    'last_used_at' => $key->last_used_at,
                    'expires_at' => $key->expires_at,
                    'is_active' => $key->is_active,
                    'created_at' => $key->created_at,
                ];
            });

        return response()->json($keys);
    }

    /**
     * Create a new API key.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'permissions' => 'required|array',
            'permissions.*' => 'in:services.read,orders.create,orders.read,balance.read',
            'rate_limit' => 'nullable|integer|min:10|max:1000',
            'expires_at' => 'nullable|date|after:now',
        ]);

        // Generate unique API key
        do {
            $key = 'sk_' . Str::random(48);
        } while (ApiKey::where('key', $key)->exists());

        // Generate secret (for future HMAC signing)
        $secret = Str::random(64);

        $apiKey = $request->user()->apiKeys()->create([
            'name' => $request->name,
            'key' => $key,
            'secret' => Hash::make($secret),
            'type' => 'secret',
            'permissions' => $request->permissions,
            'rate_limit' => $request->rate_limit ?? 100,
            'expires_at' => $request->expires_at,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Clé API créée avec succès',
            'api_key' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key' => $apiKey->key,
                'secret' => $secret, // Only shown once!
                'permissions' => $apiKey->permissions,
                'rate_limit' => $apiKey->rate_limit,
                'expires_at' => $apiKey->expires_at,
            ],
            'warning' => 'Conservez cette clé en lieu sûr, elle ne sera plus affichée.'
        ], 201);
    }

    /**
     * Show API key details.
     */
    public function show(Request $request, $id)
    {
        $key = $request->user()->apiKeys()->findOrFail($id);

        return response()->json([
            'id' => $key->id,
            'name' => $key->name,
            'key' => $key->key,
            'type' => $key->type,
            'permissions' => $key->permissions,
            'whitelist_ips' => $key->whitelist_ips,
            'rate_limit' => $key->rate_limit,
            'daily_requests' => $key->daily_requests,
            'last_used_at' => $key->last_used_at,
            'last_used_ip' => $key->last_used_ip,
            'expires_at' => $key->expires_at,
            'is_active' => $key->is_active,
            'created_at' => $key->created_at,
        ]);
    }

    /**
     * Revoke (delete) an API key.
     */
    public function destroy(Request $request, $id)
    {
        $key = $request->user()->apiKeys()->findOrFail($id);
        $key->delete();

        return response()->json([
            'message' => 'Clé API révoquée avec succès'
        ]);
    }

    /**
     * Get API key usage logs.
     */
    public function logs(Request $request, $id)
    {
        $key = $request->user()->apiKeys()->findOrFail($id);

        $logs = $key->apiLogs()
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($logs);
    }
}
