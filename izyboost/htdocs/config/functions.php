<?php
// Fonction pour envoyer des réponses JSON standardisées
function jsonResponse($success, $message = '', $data = [], $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'code' => $httpCode
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Valider un email
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Valider un mot de passe (au moins 8 caractères, 1 majuscule, 1 chiffre)
function isValidPassword($password) {
    return preg_match('/^(?=.*[A-Z])(?=.*\d).{8,}$/', $password);
}

// Générer un code de vérification
function generateVerificationCode() {
    return bin2hex(random_bytes(16));
}

// Hacher le mot de passe
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}
?>