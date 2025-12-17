<!DOCTYPE html>
<html lang="fr" style="margin:0;padding:0;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification de compte</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(90deg, #4A90E2, #007BFF);
            padding: 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        .code-box {
            display: inline-block;
            background: #f0f4ff;
            color: #007BFF;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 5px;
            padding: 12px 24px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 28px;
            margin-top: 20px;
            background: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        .btn:hover {
            background: #0056b3;
        }
        .footer {
            background: #f4f6f8;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777;
        }
        @media (max-width: 600px) {
            .code-box {
                font-size: 22px;
                letter-spacing: 3px;
                padding: 10px 18px;
            }
            .btn {
                padding: 10px 20px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Vérification de votre compte</h1>
        </div>
        <div class="content">
            <p>Bonjour, <?php echo $nom;?></p>
            <p>Voici votre code de vérification :</p>
            <div class="code-box"><?php echo $code;?></div>
            <p>Ou cliquez simplement sur le bouton ci-dessous pour valider votre compte :</p>
            <a href="https://izyboost.com/valider?token=CODE_UNIQUE" class="btn">Valider mon compte par ici</a>
        </div>
        <div class="footer">
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
        </div>
    </div>
</body>
</html>