
<?php
// tracker.php

// Connexion à la base de données
$host = 'sql310.infinityfree.com';
$dbname = 'if0_39106178_izyboost';
$username = 'if0_39106178';
$password = 'RTNrS9RYwvPu';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Récupérer la page actuelle
$page = $_SERVER['REQUEST_URI'];
$today = date('Y-m-d');

// Enregistrer la visite générale
$stmt = $pdo->prepare("INSERT INTO visites (page, vues, date_visite) VALUES (?, 1, ?) 
                      ON DUPLICATE KEY UPDATE vues = vues + 1");
$stmt->execute([$page, $today]);

// Si l'utilisateur est connecté, enregistrer sa visite
if (isset($_SESSION['user_id'])) {
    $userId = $_SESSION['user_id'];
    $now = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("INSERT INTO visites_utilisateurs (page, utilisateur_id, date_visite) VALUES (?, ?, ?)");
    $stmt->execute([$page, $userId, $now]);
}
?>
