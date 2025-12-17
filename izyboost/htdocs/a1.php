<?php
header("Content-Type: application/json; charset=UTF-8");
session_start();
require 'db.php';

// Désactiver l'affichage des erreurs en production
ini_set('display_errors', 0);
error_reporting(0);

// Fonction pour envoyer des réponses JSON standardisées
function jsonResponse($success, $message = '', $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Vérifier si l'utilisateur est déjà connecté
if (isset($_SESSION['user_id'])) {
    jsonResponse(true, 'Utilisateur déjà connecté', [
        'redirect' => 'accueil.php'
    ]);
}

// Seulement accepter les requêtes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Méthode non autorisée', [], 405);
}

// Récupérer les données JSON si Content-Type est application/json
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() === JSON_ERROR_NONE) {
    $_POST = array_merge($_POST, $input);
}

// Valider les entrées
$email = filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL);
$password = $_POST['password'] ?? '';
$remember = isset($_POST['remember']);

// Validation des champs obligatoires
if (empty($email) || empty($password)) {
    jsonResponse(false, 'Veuillez remplir tous les champs', [], 400);
}

// Validation du format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Adresse email invalide', [], 400);
}

// Vérification des identifiants
try {
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(false, 'Identifiants incorrects', [], 401);
    }

    // Connexion réussie
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $email;
    
    // Option "Se souvenir de moi"
    if ($remember) {
        $cookieValue = json_encode([
            'id' => $user['id'],
            'token' => bin2hex(random_bytes(32))
        ]);
        
        setcookie(
            'remember_token', 
            $cookieValue, 
            time() + (86400 * 30), 
            "/", 
            "", 
            true,  // Secure
            true   // HttpOnly
        );
    }

    jsonResponse(true, 'Connexion réussie', [
        'user_id' => $user['id'],
        'email' => $email,
        'redirect' => 'accueil.php'
    ]);

} catch (PDOException $e) {
    // Loguer l'erreur en production
    error_log('Database error: ' . $e->getMessage());
    jsonResponse(false, 'Erreur de base de données', [], 500);
}
?>