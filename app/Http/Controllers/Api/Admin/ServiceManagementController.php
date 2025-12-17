<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Category;
use App\Models\ApiProvider;
use Illuminate\Http\Request;

class ServiceManagementController extends Controller
{
    /**
     * List all services.
     */
    public function index(Request $request)
    {
        $query = Service::with(['category', 'apiProvider']);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $services = $query->latest()->paginate(50);
        return response()->json($services);
    }

    /**
     * Update service.
     */
    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $request->validate([
            'is_active' => 'sometimes|boolean',
            'base_price_per_unit' => 'sometimes|numeric',
            'user_margin_percent' => 'sometimes|numeric',
        ]);

        $service->update($request->only([
            'is_active',
            'base_price_per_unit',
            'user_margin_percent',
        ]));

        return response()->json([
            'message' => 'Service mis à jour',
            'service' => $service,
        ]);
    }

    /**
     * List categories.
     */
    public function categories()
    {
        $categories = Category::withCount('services')->get();
        return response()->json($categories);
    }

    /**
     * Update category.
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'is_active' => 'sometimes|boolean',
            'position' => 'sometimes|integer',
        ]);

        $category->update($request->only(['name', 'is_active', 'position']));

        return response()->json([
            'message' => 'Catégorie mise à jour',
            'category' => $category,
        ]);
    }

    /**
     * List API providers.
     */
    public function providers()
    {
        $providers = ApiProvider::all();
        return response()->json($providers);
    }

    /**
     * Sync services from provider.
     */
    public function syncServices(Request $request)
    {
        \Artisan::call('smm:sync-services');
        
        return response()->json([
            'message' => 'Synchronisation des services lancée',
        ]);
    }
}
