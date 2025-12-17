<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Transaction;
use App\Models\WhiteLabelSite;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics.
     */
    public function index(Request $request)
    {
        // Users statistics
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $newUsersToday = User::whereDate('created_at', today())->count();
        $newUsersThisMonth = User::whereMonth('created_at', now()->month)->count();

        // Orders statistics
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $ordersToday = Order::whereDate('created_at', today())->count();

        // Financial statistics
        $totalRevenue = Transaction::where('status', 'completed')
            ->where('type', 'deposit')
            ->sum('net_amount');
        
        $revenueToday = Transaction::where('status', 'completed')
            ->where('type', 'deposit')
            ->whereDate('created_at', today())
            ->sum('net_amount');

        $revenueThisMonth = Transaction::where('status', 'completed')
            ->where('type', 'deposit')
            ->whereMonth('created_at', now()->month)
            ->sum('net_amount');

        $platformBalance = User::sum('balance');

        // White Label statistics
        $totalSites = WhiteLabelSite::count();
        $activeSites = WhiteLabelSite::where('status', 'active')->count();

        // Support statistics
        $openTickets = Ticket::where('status', 'open')->count();
        $pendingTickets = Ticket::where('status', 'pending')->count();

        // Recent activities
        $recentOrders = Order::with(['user:id,username', 'service:id,name'])
            ->latest()
            ->limit(10)
            ->get();

        $recentUsers = User::latest()
            ->limit(10)
            ->get(['id', 'username', 'email', 'created_at', 'balance']);

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_today' => $newUsersToday,
                'new_this_month' => $newUsersThisMonth,
            ],
            'orders' => [
                'total' => $totalOrders,
                'pending' => $pendingOrders,
                'completed' => $completedOrders,
                'today' => $ordersToday,
            ],
            'finance' => [
                'total_revenue' => $totalRevenue,
                'revenue_today' => $revenueToday,
                'revenue_this_month' => $revenueThisMonth,
                'platform_balance' => $platformBalance,
            ],
            'white_label' => [
                'total_sites' => $totalSites,
                'active_sites' => $activeSites,
            ],
            'support' => [
                'open_tickets' => $openTickets,
                'pending_tickets' => $pendingTickets,
            ],
            'recent_orders' => $recentOrders,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * Get revenue chart data.
     */
    public function revenueChart(Request $request)
    {
        $days = $request->input('days', 30);

        $data = Transaction::where('status', 'completed')
            ->where('type', 'deposit')
            ->where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(net_amount) as revenue')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($data);
    }
}
