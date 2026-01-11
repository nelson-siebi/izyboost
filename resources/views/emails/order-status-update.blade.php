<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .header.success { background: #059669; }
        .header.error { background: #dc2626; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
        .details { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header {{ $order->status === 'completed' ? 'success' : ($order->status === 'cancelled' ? 'error' : '') }}">
            <h1>Mise à jour de votre Commande #{{ $order->id }}</h1>
        </div>
        <div class="content">
            <p>Bonjour {{ $order->user->username ?? 'Client' }},</p>
            <p>Le statut de votre commande de boost a été mis à jour.</p>
            
            <div class="details">
                <p><strong>Service :</strong> {{ $order->service->name ?? 'Service Boost' }}</p>
                <p><strong>Nouveau Statut :</strong> 
                    <span style="font-weight: bold; text-transform: uppercase;">
                        @switch($order->status)
                            @case('completed') Terminé @break
                            @case('processing') En cours de traitement @break
                            @case('in_progress') En cours @break
                            @case('cancelled') Annulé @break
                            @default {{ $order->status }}
                        @endswitch
                    </span>
                </p>
                <p><strong>Quantité :</strong> {{ number_format($order->quantity, 0, ',', ' ') }}</p>
                <p><strong>Lien :</strong> <a href="{{ $order->link }}">{{ $order->link }}</a></p>
            </div>

            @if($order->status === 'completed')
                <p>Merci pour votre confiance ! Votre boost a été livré avec succès.</p>
            @elseif($order->status === 'cancelled')
                <p>Votre commande a malheureusement été annulée. Si un paiement a été effectué, vos fonds ont été recrédités sur votre solde.</p>
            @endif

            <p style="text-align: center;">
                <a href="{{ config('app.url') }}/dashboard" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Accéder à mon tableau de bord</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} IzyBoost. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
