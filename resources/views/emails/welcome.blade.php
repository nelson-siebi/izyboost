<x-mail::message>
    # 🎉 Bienvenue sur IzyBoost !

    Bonjour **{{ $user->username }}**,

    Nous sommes ravis de vous accueillir sur **IzyBoost**, votre plateforme de boostage SMM !

    ### 🚀 Commencez dès maintenant :

    - ✅ Rechargez votre compte
    - ✅ Explorez nos services (TikTok, Instagram, YouTube...)
    - ✅ Passez votre première commande
    - ✅ Parrainez vos amis et gagnez des commissions

    @if($user->sponsor_code)
        <x-mail::panel>
            ### 💰 Votre code de parrainage
            # {{ $user->sponsor_code }}
            Partagez-le et gagnez jusqu'à 10% de commission sur les commandes de vos filleuls !
        </x-mail::panel>
    @endif

    <x-mail::button :url="config('app.url') . '/dashboard'" color="success">
        Accéder au Dashboard
    </x-mail::button>

    Si vous avez des questions, notre équipe support est là pour vous aider !

    À bientôt,<br>
    **L'équipe IzyBoost**
</x-mail::message>