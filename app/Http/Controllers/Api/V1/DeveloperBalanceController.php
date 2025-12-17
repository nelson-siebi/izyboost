<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeveloperBalanceController extends Controller
{
    /**
     * Get account balance.
     */
    public function index(Request $request)
    {
        $apiKey = $request->get('api_key');
        
        if (!in_array('balance.read', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée',
                'message' => 'Votre clé API n\'a pas la permission balance.read'
            ], 403);
        }

        $user = $apiKey->user;

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->balance,
                'currency' => $user->currency,
            ]
        ]);
    }
}
