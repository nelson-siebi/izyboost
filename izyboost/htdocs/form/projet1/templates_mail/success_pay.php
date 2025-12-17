<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de Paiement</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 30px;
            text-align: center;
        }
        .success-icon {
            font-size: 60px;
            color: #4CAF50;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
        }
        p {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            margin-top: 20px;
            background-color: #4CAF50;
            color: #fff;
            padding: 12px 25px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #43a047;
        }
        .footer {
            margin-top: 40px;
            font-size: 14px;
            color: #999;
        }
        .footer a {
            color: #999;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="success-icon">✅</div>
    <h1>Paiement Réussi</h1>
    <p>Merci <strong><?php echo htmlspecialchars($nom); ?></strong>,<br>
       Votre paiement d’un montant de <strong><?php echo htmlspecialchars($amount); ?> FCFA</strong> a été confirmé avec succès.<br>
       Vous recevrez un email contenant les détails de la transaction.</p>

    <a href="https://izyboost.wuaze.com/accueil" class="btn">Retour au tableau de bord</a>

    <div class="footer">
        Vous avez une question ? <a href="mailto:nelsonsiebi237@gmail.com">Contactez le support</a>
    </div>
</div>

</body>
</html>
