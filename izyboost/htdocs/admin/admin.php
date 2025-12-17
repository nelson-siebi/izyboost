<?php
session_start();
if(isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header("Location: dashboard.php");
    exit;
}

// Mot de passe admin (à changer et sécuriser)
$admin_password = "nexky237";

if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $password = $_POST['password'] ?? '';
    
    if($password==$admin_password) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_last_activity'] = time();
        header("Location: dashboard.php");
        exit;
    } else {
        $error = "Mot de passe incorrect";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion Admin | Interface Futuriste</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="holographic-card">
            <div class="logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#00f0ff" stroke-width="3"/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="#00f0ff" stroke-width="3"/>
                </svg>
                <h1>PANEL ADMIN</h1>
            </div>
            
            <?php if(isset($error)): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <form method="POST" class="login-form">
                <div class="input-group">
                    <input type="password" name="password" required class="neon-input">
                    <label>Mot de passe admin</label>
                    <span class="highlight"></span>
                    <span class="bar"></span>
                </div>
                <button type="submit" class="neon-button">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    CONNEXION
                </button>
            </form>
        </div>
    </div>
    <script src="assets/js/script.js"></script>
</body>
</html>