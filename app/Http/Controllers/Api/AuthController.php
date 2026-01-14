<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request, \App\Services\ReferralService $referralService)
    {
        $request->validate([
            'username' => 'required|string|max:50|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'sponsor_code' => 'nullable|string|exists:users,sponsor_code',
        ], [
            'username.required' => 'L\'identifiant est obligatoire.',
            'username.unique' => 'Cet identifiant est déjà utilisé.',
            'username.max' => 'L\'identifiant ne doit pas dépasser 50 caractères.',
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'sponsor_code.exists' => 'Le code de parrainage est invalide.',
        ]);

        $sponsorId = null;
        if ($request->sponsor_code) {
            $sponsor = User::where('sponsor_code', $request->sponsor_code)->first();
            $sponsorId = $sponsor?->id;
        }

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'sponsor_id' => $sponsorId,
            'role' => 'user',
            'is_active' => true,
        ]);

        // Create Referral Chain if sponsor code provided
        if ($request->sponsor_code) {
            $referralService->createReferralChain($user, $request->sponsor_code);
        }

        // Send welcome email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\WelcomeEmail($user));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send welcome email to {$user->email}: " . $e->getMessage());
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    /**
     * Login user and create token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email_or_username' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginType = filter_var($request->email_or_username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $user = User::where($loginType, $request->email_or_username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email_or_username' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'Votre compte a été banni.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie']);
    }

    /**
     * Get authenticated user details.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($request->only(['username', 'email']));

        return response()->json([
            'message' => 'Profile mis à jour avec succès',
            'user' => $user
        ]);
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Mot de passe mis à jour avec succès'
        ]);
    }

    /**
     * Update user settings.
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();
        $user->update([
            'settings' => array_merge($user->settings ?? [], $request->all())
        ]);

        return response()->json([
            'message' => 'Paramètres mis à jour',
            'user' => $user
        ]);
    }

    /**
     * Toggle Two-Factor Authentication.
     */
    public function toggle2FA(Request $request)
    {
        $user = $request->user();
        $user->update([
            'two_factor_enabled' => !$user->two_factor_enabled
        ]);

        return response()->json([
            'message' => $user->two_factor_enabled ? '2FA activé' : '2FA désactivé',
            'user' => $user
        ]);
    }
}
