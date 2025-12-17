<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ApiKey;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key') ?? $request->bearerToken();

        if (!$apiKey) {
            return response()->json([
                'error' => 'API key manquante',
                'message' => 'Veuillez fournir une clé API valide dans le header X-API-Key ou Authorization: Bearer'
            ], 401);
        }

        $key = ApiKey::where('key', $apiKey)
            ->where('is_active', true)
            ->first();

        if (!$key) {
            return response()->json([
                'error' => 'API key invalide',
                'message' => 'La clé API fournie est invalide ou a été révoquée'
            ], 401);
        }

        // Check expiration
        if ($key->expires_at && $key->expires_at->isPast()) {
            return response()->json([
                'error' => 'API key expirée',
                'message' => 'Cette clé API a expiré'
            ], 401);
        }

        // Check IP whitelist
        if ($key->whitelist_ips && !in_array($request->ip(), $key->whitelist_ips)) {
            return response()->json([
                'error' => 'IP non autorisée',
                'message' => 'Votre adresse IP n\'est pas autorisée pour cette clé API'
            ], 403);
        }

        // Update usage stats
        $key->increment('daily_requests');
        $key->update([
            'last_used_at' => now(),
            'last_used_ip' => $request->ip(),
        ]);

        // Attach user and key to request
        $request->merge(['api_key' => $key]);
        $request->setUserResolver(fn() => $key->user);

        return $next($request);
    }
}
