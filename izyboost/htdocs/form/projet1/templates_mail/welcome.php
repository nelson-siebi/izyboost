<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bienvenue</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #3f87a6, #ebf8e1);
      color: white;
      text-align: center;
      padding: 40px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .content {
      padding: 30px;
      text-align: center;
      color: #333;
    }
    .content h2 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f0f0f0;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #777;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #3f87a6;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      transition: background 0.3s ease;
    }
    .button:hover {
      background-color: #2c6b85;
    }
  </style>
</head>
<body>

<div class="container">
  <div class="header">
    <h1>🎉 Bienvenue à bord !de izyboost</h1>
  </div>
  <div class="content">
    <h2>Bonjour <?php echo$nom;?>,</h2>
    <p>Nous sommes ravis de vous compter parmi nous. Votre adresse e-mail <strong><?php echo$email;?>,</strong> a bien été enregistrée.</p>
    <p>Explorez notre plateforme et profitez de tous les avantages réservés à nos membres.</p>
    <p>vous etes arriver au bon moment de notre super promotion. beeficiez de 35% de reduction cette semaine 
    <a href="https://izyboost.wuaze.com/accueil.php" class="button">Commencer maintenant</a>
  </div>
  <div class="footer">
    &copy; 2025 izyboost.wuaze.com – Tous droits réservés.
  </div>
</div>

</body>
</html>
