
<?php include 'tracker.php'; ?>
<?php
session_start();
$error = $_GET['error'] ?? null;
?>
<?php

require 'db.php'; 

if (isset($_SESSION['user_id'])) {
    header("Location: accueil.php");
    exit;
}
?>


<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Connexion - IZYBOOST</title>
  <link rel="stylesheet" href="assets/css/login.css">
</head>
<body>

  <div class="auth-container">
    <div class="auth-form">
      <h1>Connectez-vous</h1>
      <?php if ($error): ?>
        <div class="error-message" style="color:red;"><?= htmlspecialchars($error) ?></div>
      <?php endif; ?>
      <form id="loginForm" method="POST" action="a1.php">
        <div class="form-group">
          <label for="email">Adresse email</label>
          <input type="text" id="email" name="email" required>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required>
        </div>

        <div class="form-options">
          <input type="checkbox" id="remember" name="remember">
          <label for="remember">Se souvenir de moi</label>
        </div>

        <button type="submit" class="btn-auth">Se connecter</button>
      </form>

      <p>Pas encore de compte ? <a href="signup.php">Inscrivez-vous</a></p>
    </div>
  </div>

</body>
</html>
