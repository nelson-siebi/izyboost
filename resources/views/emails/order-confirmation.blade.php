<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #cfe2ff; color: #084298; }
        .status-completed { background: #d1e7dd; color: #0f5132; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Commande Confirmée</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $order->user->username }}</strong>,</p>
            
            <p>Votre commande a été confirmée et est en cours de traitement !</p>
            
            <div class="order-details">
                <h3>📦 Détails de la commande</h3>
                <p><strong>Numéro :</strong> #{{ $order->id }}</p>
                <p><strong>Service :</strong> {{ $order->service->name }}</p>
                <p><strong>Quantité :</strong> {{ $order->quantity }}</p>
                <p><strong>Lien :</strong> {{ $order->link }}</p>
                <p><strong>Montant :</strong> {{ $order->sell_price }} XAF</p>
                <p><strong>Statut :</strong> <span class="status status-{{ $order->status }}">{{ ucfirst($order->status) }}</span></p>
            </div>
            
            <p>⏱️ <strong>Délai de livraison :</strong> Les services seront livrés dans les prochaines heures.</p>
            
            <p>Vous pouvez suivre l'avancement de votre commande depuis votre tableau de bord.</p>
            
            <p>Merci de votre confiance,<br><strong>L'équipe IzyBoost</strong></p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} IzyBoost. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
