<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 10px;
        }

        .header {
            background: #f97316;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }

        .content {
            padding: 20px;
        }

        .footer {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 20px;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #f97316;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }

        .details {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Nouveau Dépôt en Attente</h1>
        </div>
        <div class="content">
            <p>Bonjour Admin,</p>
            <p>Une nouvelle demande de dépôt vient d'être initiée sur <strong>IzyBoost</strong> et nécessite votre
                validation.</p>

            <div class="details">
                <p><strong>Utilisateur :</strong>
                    {{ $transaction->user->username ?? 'Utilisateur ID #' . $transaction->user_id }}</p>
                <p><strong>Montant :</strong> {{ number_format($transaction->amount, 0, ',', ' ') }} F</p>
                <p><strong>Méthode :</strong> {{ $transaction->paymentMethod->name ?? $transaction->payment_method }}
                </p>
                <p><strong>Référence :</strong> {{ $transaction->reference }}</p>
                <p><strong>Date :</strong> {{ $transaction->created_at->format('d/m/Y H:i') }}</p>
            </div>

            <p style="text-align: center;">
                <a href="{{ config('app.url') }}/admin/finance" class="button">Vérifier dans l'Admin</a>
            </p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé automatiquement par le système IzyBoost.</p>
        </div>
    </div>
</body>

</html>