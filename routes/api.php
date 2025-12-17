<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('/services', [\App\Http\Controllers\Api\ServiceController::class, 'index']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::prefix('user')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Orders
        Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);

        // Wallet
        Route::prefix('wallet')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\WalletController::class, 'index']);
            Route::get('/transactions', [\App\Http\Controllers\Api\WalletController::class, 'transactions']);
            Route::get('/deposit-methods', [\App\Http\Controllers\Api\WalletController::class, 'depositMethods']);
            Route::post('/deposit', [\App\Http\Controllers\Api\WalletController::class, 'deposit']);
        });

        // White Label
        Route::prefix('white-label')->group(function () {
            Route::get('/plans', [\App\Http\Controllers\Api\WhiteLabelController::class, 'plans']);
            Route::get('/templates', [\App\Http\Controllers\Api\WhiteLabelController::class, 'templates']);
            
            // Site management
            Route::post('/purchase', [\App\Http\Controllers\Api\SiteController::class, 'purchase']);
            Route::get('/sites', [\App\Http\Controllers\Api\SiteController::class, 'index']);
            Route::get('/sites/{uuid}', [\App\Http\Controllers\Api\SiteController::class, 'show']);
            Route::put('/sites/{uuid}/branding', [\App\Http\Controllers\Api\SiteController::class, 'updateBranding']);
            Route::put('/sites/{uuid}/pricing', [\App\Http\Controllers\Api\SiteController::class, 'updatePricing']);
        });

        // API Keys Management
        Route::prefix('api-keys')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\ApiKeyController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\ApiKeyController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\Api\ApiKeyController::class, 'show']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\ApiKeyController::class, 'destroy']);
            Route::get('/{id}/logs', [\App\Http\Controllers\Api\ApiKeyController::class, 'logs']);
        });

        // Tickets (Support)
        Route::prefix('tickets')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\TicketController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\Api\TicketController::class, 'store']);
            Route::get('/{uuid}', [\App\Http\Controllers\Api\TicketController::class, 'show']);
            Route::post('/{uuid}/reply', [\App\Http\Controllers\Api\TicketController::class, 'reply']);
            Route::post('/{uuid}/close', [\App\Http\Controllers\Api\TicketController::class, 'close']);
        });

        // Notifications
        Route::prefix('notifications')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
            Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount']);
            Route::post('/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
            Route::post('/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy']);
        });

        // Referrals
        Route::prefix('referrals')->group(function () {
            Route::get('/stats', [\App\Http\Controllers\Api\ReferralController::class, 'stats']);
            Route::get('/list', [\App\Http\Controllers\Api\ReferralController::class, 'referrals']);
            Route::get('/commissions', [\App\Http\Controllers\Api\ReferralController::class, 'commissions']);
            Route::get('/link', [\App\Http\Controllers\Api\ReferralController::class, 'link']);
        });
    });

    // Admin Routes
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        Route::get('/dashboard/revenue-chart', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'revenueChart']);

        // User Management
        Route::prefix('users')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'update']);
            Route::post('/{id}/toggle-ban', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'toggleBan']);
            Route::post('/{id}/adjust-balance', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'adjustBalance']);
            Route::delete('/{id}', [\App\Http\Controllers\Api\Admin\UserManagementController::class, 'destroy']);
        });

        // Order Management
        Route::prefix('orders')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\OrderManagementController::class, 'index']);
            Route::get('/{id}', [\App\Http\Controllers\Api\Admin\OrderManagementController::class, 'show']);
            Route::put('/{id}/status', [\App\Http\Controllers\Api\Admin\OrderManagementController::class, 'updateStatus']);
            Route::post('/{id}/refund', [\App\Http\Controllers\Api\Admin\OrderManagementController::class, 'refund']);
        });

        // Financial Management
        Route::prefix('finance')->group(function () {
            Route::get('/stats', [\App\Http\Controllers\Api\Admin\FinancialController::class, 'stats']);
            Route::get('/transactions', [\App\Http\Controllers\Api\Admin\FinancialController::class, 'transactions']);
            Route::post('/transactions/{id}/verify', [\App\Http\Controllers\Api\Admin\FinancialController::class, 'verifyTransaction']);
            Route::get('/payment-methods', [\App\Http\Controllers\Api\Admin\FinancialController::class, 'paymentMethods']);
            Route::put('/payment-methods/{id}', [\App\Http\Controllers\Api\Admin\FinancialController::class, 'updatePaymentMethod']);
        });

        // Service Management
        Route::prefix('services')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'index']);
            Route::put('/{id}', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'update']);
            Route::get('/categories', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'categories']);
            Route::put('/categories/{id}', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'updateCategory']);
            Route::get('/providers', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'providers']);
            Route::post('/sync', [\App\Http\Controllers\Api\Admin\ServiceManagementController::class, 'syncServices']);
        });

        // White Label Management
        Route::prefix('white-label')->group(function () {
            Route::get('/sites', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'sites']);
            Route::get('/sites/{id}', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'showSite']);
            Route::post('/sites/{id}/toggle-status', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'toggleSiteStatus']);
            Route::get('/plans', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'plans']);
            Route::put('/plans/{id}', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'updatePlan']);
            Route::get('/templates', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'templates']);
            Route::get('/subscriptions', [\App\Http\Controllers\Api\Admin\WhiteLabelController::class, 'subscriptions']);
        });

        // Support Management
        Route::prefix('support')->group(function () {
            Route::get('/tickets', [\App\Http\Controllers\Api\Admin\SupportController::class, 'tickets']);
            Route::get('/tickets/{uuid}', [\App\Http\Controllers\Api\Admin\SupportController::class, 'showTicket']);
            Route::post('/tickets/{uuid}/assign', [\App\Http\Controllers\Api\Admin\SupportController::class, 'assignTicket']);
            Route::post('/tickets/{uuid}/reply', [\App\Http\Controllers\Api\Admin\SupportController::class, 'replyTicket']);
            Route::post('/tickets/{uuid}/close', [\App\Http\Controllers\Api\Admin\SupportController::class, 'closeTicket']);
        });

        // Settings & Configuration
        Route::prefix('settings')->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'index']);
            Route::put('/{key}', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'update']);
            Route::get('/platform-stats', [\App\Http\Controllers\Api\Admin\SettingsController::class, 'platformStats']);
        });
    });
});
