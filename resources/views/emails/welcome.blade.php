<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bienvenue sur IzyBoost !</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $user->username }}</strong>,</p>
            
            <p>Nous sommes ravis de vous accueillir sur <strong>IzyBoost</strong>, votre plateforme de boostage SMM !</p>
            
            <h3>🚀 Commencez dès maintenant :</h3>
            <ul>
                <li>✅ Rechargez votre compte</li>
                <li>✅ Explorez nos services (TikTok, Instagram, YouTube...)</li>
                <li>✅ Passez votre première commande</li>
                <li>✅ Parrainez vos amis et gagnez des commissions</li>
            </ul>
            
            @if($user->sponsor_code)
            <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>💰 Votre code de parrainage :</h4>
                <p style="font-size: 24px; font-weight: bold; color: #667eea;">{{ $user->sponsor_code }}</p>
                <p>Partagez-le et gagnez jusqu'à 10% de commission sur les commandes de vos filleuls !</p>
            </div>
            @endif
            
            <a href="{{ config('app.url') }}/dashboard" class="button">Accéder au Dashboard</a>
            
            <p>Si vous avez des questions, notre équipe support est là pour vous aider !</p>
            
            <p>À bientôt,<br><strong>L'équipe IzyBoost</strong></p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} IzyBoost. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
