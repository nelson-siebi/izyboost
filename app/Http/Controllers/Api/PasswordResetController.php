<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Send a reset link to the given user.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        // Always return 200 for security (don't reveal if email exists)
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.']);
        }

        // Log the actual error for debugging
        \Log::info('Password reset failed', [
            'email' => $request->email,
            'status' => $status
        ]);

        // Return success message anyway (security best practice)
        return response()->json(['message' => 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.']);
    }

    /**
     * Reset the given user's password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60))->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Votre mot de passe a été réinitialisé.'])
            : response()->json(['message' => 'Le lien de réinitialisation est invalide ou a expiré.'], 400);
    }
}
