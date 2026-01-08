<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API V1 Routes (For Developers)
|--------------------------------------------------------------------------
|
| These routes are for external developers using API keys.
| All routes require API key authentication via X-API-Key header.
|
*/

Route::prefix('v1')->middleware('api.key')->group(function () {
    
    // Services
    Route::get('/services', [\App\Http\Controllers\Api\V1\DeveloperServiceController::class, 'index']);
    Route::get('/services/{id}', [\App\Http\Controllers\Api\V1\DeveloperServiceController::class, 'show']);
    
    // Orders
    Route::post('/orders', [\App\Http\Controllers\Api\V1\DeveloperOrderController::class, 'store']);
    Route::get('/orders', [\App\Http\Controllers\Api\V1\DeveloperOrderController::class, 'index']);
    Route::get('/orders/{id}', [\App\Http\Controllers\Api\V1\DeveloperOrderController::class, 'status']);
    
    // Balance
    Route::get('/balance', [\App\Http\Controllers\Api\V1\DeveloperBalanceController::class, 'index']);
});
