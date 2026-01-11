<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{
    /**
     * List all users with filters.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Filters
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('id', $search);
            });
        }

        $users = $query->withCount(['orders', 'transactions', 'whiteLabelSites'])
            ->latest()
            ->paginate(50);

        // Expose ID for admin panel since it's hidden in the model
        $users->getCollection()->transform(function ($user) {
            $user->makeVisible(['id']);
            return $user;
        });

        return response()->json($users);
    }

    /**
     * Get user details.
     */
    public function show($id)
    {
        $user = User::with([
            'orders' => function ($q) {
                $q->latest()->limit(10);
            },
            'transactions' => function ($q) {
                $q->latest()->limit(10);
            },
            'whiteLabelSites',
            'tickets',
        ])->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Update user.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'username' => 'sometimes|string|max:50|unique:users,username,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin,super_admin',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($request->only([
            'username',
            'email',
            'role',
            'is_active',
        ]));

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user,
        ]);
    }

    /**
     * Ban/Unban user.
     */
    public function toggleBan($id)
    {
        $user = User::findOrFail($id);
        $user->update(['is_banned' => !$user->is_banned]);

        return response()->json([
            'message' => $user->is_banned ? 'Utilisateur banni' : 'Utilisateur débanni',
            'is_banned' => $user->is_banned,
        ]);
    }

    /**
     * Adjust user balance.
     */
    public function adjustBalance(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric',
            'type' => 'required|in:add,subtract,set',
            'reason' => 'required|string',
        ]);

        $user = User::findOrFail($id);

        switch ($request->type) {
            case 'add':
                $user->increment('balance', $request->amount);
                break;
            case 'subtract':
                $user->decrement('balance', $request->amount);
                break;
            case 'set':
                $user->update(['balance' => $request->amount]);
                break;
        }

        // Create transaction record
        $walletMethod = \App\Models\PaymentMethod::firstOrCreate(
            ['code' => 'wallet'],
            [
                'name' => 'Solde Principal',
                'type' => 'ewallet',
                'is_active' => true,
                'min_amount' => 0,
                'max_amount' => 10000000,
                'currencies' => ['XAF'],
                'config' => [],
            ]
        );

        \App\Models\Transaction::create([
            'user_id' => $user->id,
            'payment_method_id' => $walletMethod->id,
            'type' => 'transfer',
            'amount' => abs($request->amount),
            'fees' => 0,
            'net_amount' => abs($request->amount),
            'currency' => 'XAF',
            'status' => 'completed',
            'description' => "Ajustement admin: {$request->reason}",
            'completed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Solde ajusté',
            'new_balance' => $user->fresh()->balance,
        ]);
    }

    /**
     * Delete user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'super_admin') {
            return response()->json([
                'error' => 'Impossible de supprimer un super admin'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé',
        ]);
    }
}
