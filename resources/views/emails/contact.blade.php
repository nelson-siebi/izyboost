<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message de contact</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .content {
            padding: 30px;
        }

        .field {
            margin-bottom: 20px;
        }

        .field-label {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.05em;
            margin-bottom: 5px;
        }

        .field-value {
            font-size: 16px;
            color: #1e293b;
            font-weight: 500;
        }

        .message-box {
            background: #f1f5f9;
            border-left: 4px solid #6366f1;
            padding: 20px;
            border-radius: 8px;
            margin-top: 10px;
        }

        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>📧 Nouveau Message de Contact</h1>
        </div>

        <div class="content">
            <div class="field">
                <div class="field-label">Nom</div>
                <div class="field-value">{{ $name }}</div>
            </div>

            <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">
                    <a href="mailto:{{ $email }}" style="color: #6366f1; text-decoration: none;">{{ $email }}</a>
                </div>
            </div>

            <div class="field">
                <div class="field-label">Sujet</div>
                <div class="field-value">{{ $subject }}</div>
            </div>

            <div class="field">
                <div class="field-label">Message</div>
                <div class="message-box">
                    {!! nl2br(e($user_message)) !!}
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Ce message a été envoyé depuis le formulaire de contact de votre site.</p>
            <p>Vous pouvez répondre directement à cet email pour contacter l'expéditeur.</p>
        </div>
    </div>
</body>

</html>