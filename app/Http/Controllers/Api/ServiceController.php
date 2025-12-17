<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ServiceController extends Controller
{
    /**
     * List all active services grouped by category.
     */
    public function index(Request $request)
    {
        $categories = Category::where('is_active', true)
            ->whereHas('services', function ($query) {
                $query->where('is_active', true);
            })
            ->with(['services' => function ($query) {
                $query->where('is_active', true)
                      ->select('id', 'category_id', 'name', 'type', 'min_quantity', 'max_quantity', 'base_price_per_unit', DB::raw('base_price_per_unit * 1000 as rate'), 'drip_feed');
            }])
            ->orderBy('position')
            ->get();

        return response()->json($categories);
    }
}
