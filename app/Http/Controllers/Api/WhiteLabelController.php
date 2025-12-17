<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhiteLabelPlan;
use App\Models\WhiteLabelTemplate;
use Illuminate\Http\Request;

class WhiteLabelController extends Controller
{
    /**
     * Get all active plans.
     */
    public function plans()
    {
        $plans = WhiteLabelPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($plans);
    }

    /**
     * Get all active templates.
     */
    public function templates()
    {
        $templates = WhiteLabelTemplate::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($templates);
    }
}
