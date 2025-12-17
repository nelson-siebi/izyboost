<?php
session_start();
require 'db.php'; // ton fichier de connexion PDO

$user_id = $_SESSION['user_id'] ?? null;


if (!$user_id) {
    echo json_encode(['error' => 'Utilisateur non connectée']);
    exit;
}

// Requête pour récupérer le solde
$stmt = $pdo->prepare("SELECT solde FROM users WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(['solde' => $user['solde']]);
} else {
    echo json_encode(['error' => 'Utilisateur non trouvé']);
}
