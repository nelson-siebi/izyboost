<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Nouvelle Réponse à votre Ticket</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>{{ $ticket->user->username }}</strong>,</p>
            
            <p>Vous avez reçu une nouvelle réponse concernant votre ticket de support :</p>
            
            <div class="message-box">
                <p><strong>Sujet :</strong> {{ $ticket->subject }}</p>
                <p><strong>Ticket #:</strong> {{ $ticket->id }}</p>
                <p><strong>Statut :</strong> {{ ucfirst($ticket->status) }}</p>
                <hr>
                <p><strong>Réponse :</strong></p>
                <p>{{ $message }}</p>
            </div>
            
            <p>Vous pouvez consulter et répondre à ce ticket depuis votre espace support.</p>
            
            <p>Cordialement,<br><strong>L'équipe Support IzyBoost</strong></p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} IzyBoost. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>
