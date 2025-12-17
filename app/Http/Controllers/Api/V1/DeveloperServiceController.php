<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Category;
use Illuminate\Http\Request;

class DeveloperServiceController extends Controller
{
    /**
     * List all services (for API developers).
     */
    public function index(Request $request)
    {
        // Check permission
        $apiKey = $request->get('api_key');
        if (!in_array('services.read', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée',
                'message' => 'Votre clé API n\'a pas la permission services.read'
            ], 403);
        }

        $categories = Category::where('is_active', true)
            ->whereHas('services', function ($query) {
                $query->where('is_active', true);
            })
            ->with(['services' => function ($query) {
                $query->where('is_active', true)
                      ->select('id', 'category_id', 'name', 'type', 'min_quantity', 'max_quantity', 'base_price_per_unit');
            }])
            ->orderBy('position')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get service details.
     */
    public function show(Request $request, $id)
    {
        $apiKey = $request->get('api_key');
        if (!in_array('services.read', $apiKey->permissions)) {
            return response()->json([
                'error' => 'Permission refusée'
            ], 403);
        }

        $service = Service::where('is_active', true)
            ->with('category')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }
}
