<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Initiation de votre paiement</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: #ffffff;
      text-align: center;
      padding: 30px 20px;
    }
    .header img {
      max-width: 120px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 20px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      color: #4CAF50;
    }
    .cta-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 6px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 14px;
      color: #999;
      background-color: #f0f0f0;
    }
    .social-icons {
      margin-top: 15px;
    }
    .social-icons a {
      margin: 0 10px;
      display: inline-block;
    }
    .social-icons img {
      width: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://yourdomain.com/logo.png" alt="Votre Logo">
      <h1>Paiement en cours...</h1>
    </div>
    <div class="content">
      <h2>Bonjour <?php echo htmlspecialchars($nom); ?></h2>
      <p>Nous avons bien reçu votre demande de paiement. Celui-ci est en cours de traitement et sera confirmé dans les prochaines minutes.</p>
      <p>Montant : <strong><?php echo htmlspecialchars($amount); ?> FCFA</strong></p>
      <p>Nous vous remercions pour votre confiance et restons à votre disposition pour toute question.</p>
      <a href="https://yourwebsite.com/mon-compte" class="cta-button">Suivre mon paiement</a>
    </div>
    <div class="footer">
      <p>Suivez-nous sur nos réseaux sociaux :</p>
      <div class="social-icons">
        <a href="https://facebook.com/yourpage"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
        <a href="https://instagram.com/yourpage"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram"></a>
        <a href="https://t.me/yourchannel"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111646.png" alt="Telegram"></a>
        <a href="https://wa.me/237XXXXXXXX"><img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" alt="WhatsApp"></a>
      </div>
      <p>&copy; 2025 VotreEntreprise. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
