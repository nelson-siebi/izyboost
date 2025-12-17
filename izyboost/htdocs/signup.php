<?php include 'tracker.php'; ?>

<?php
$host = 'sql310.infinityfree.com';
$db = 'if0_39106178_izyboost';
$user = 'if0_39106178';
$pass = 'RTNrS9RYwvPu';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Erreur de connexion : " . $conn->connect_error);
}



require 'db.php'; 

if (isset($_SESSION['user_id'])) {
    header("Location: accueil.php");
    exit;
}

$errors = [];
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim($_POST['nom'] ?? '');
    $numero = trim($_POST['numero'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    
    if (empty($nom)) {
        $errors[] = "Le nom est requis.";
    }

    if (empty($numero) || !preg_match('/^[0-9]{8,15}$/', $numero)) {
        $errors[] = "Numéro invalide (8 à 15 chiffres).";
    }

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Email invalide.";
    }

    if (empty($password) || strlen($password) < 6) {
        $errors[] = "Le mot de passe doit contenir au moins 6 caractères.";
    }

 
    if (empty($errors)) {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $check->bind_param("s", $email);
        $check->execute();
        $check->store_result();

        if ($check->num_rows > 0) {
            $errors[] = "Cet email est déjà utilisé.";
        }
        $check->close();
    }

  
    if (empty($errors)) {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (nom, numero, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $nom, $numero, $email, $hash);
        if ($stmt->execute()) {
            $success = "Inscription réussie.";
            header("location: login.php?success=valider");
        } else {
            $errors[] = "Erreur d'insertion : " . $stmt->error;
        }
        $stmt->close();
    }
}
?>


<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscription - IZYBOOST</title>
  <link rel="stylesheet" href="assets/css/signup.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
 <style>
 

 </style>
</head>
<body>
  <div class="auth-container">
    <div class="auth-form">
      <div class="auth-header">
        <h1>Créer un compte</h1>
        <p>Rejoignez IZYBOOST et boostez votre visibilité dès maintenant</p>
      </div>
<?php
if (!empty($errors)) {
    foreach ($errors as $e) {
        echo "<p style='color:red;'>$e</p>";
    }
}

if (!empty($success)) {
    echo "<p style='color:green;'>$success</p>";
}
?>
      <form id="registerForm" action="" method="POST">
        <div class="form-group">
          <label for="name">Nom complet</label>
          <input type="text" id="name" name="nom" required >
          <div class="error-message"></div>
        </div>

        <div class="form-group">
          <label for="email">Adresse email</label>
          <input type="email" id="email" name="email" required>
          <div class="error-message"></div>
        </div>

        <div class="form-group">
          <label for="phone">Numéro de téléphone</label>
          <div class="phone-input">
            <div class="phone-prefix">+237</div>
            <input type="tel" id="phone" name="numero" required >
          </div>
          <div class="error-message"></div>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required>
          <div class="error-message"><?= $errors['password'] ?? '' ?></div>
        </div>

    

        <button type="submit" class="btn-auth">S'inscrire</button>
      </form>

      <div class="auth-footer">
        <p>Vous avez déjà un compte? <a href="login.php">Connectez-vous</a></p>
      </div>
    </div>

    <div class="auth-image">
      <img src="image/creation-de-site-web-responsive-optimise-au-referencement-7c4eb40-778x403.png" alt="BoostCI Image">
      <div class="image-overlay">
        <h2>Boostez votre visibilité</h2>
        <p>Obtenez plus de likes, abonnés et vues sur toutes les plateformes grace a nexius ai</p>
      </div>
    </div>
  </div>

  <script src="assets/js/auth.js"></script>
</body>
</html>
