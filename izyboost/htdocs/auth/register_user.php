<?php

header("Content-Type: application/json");
require_once "config.php";

// Récupération des données JSON
$data = json_decode(file_get_contents("php://input"), true);

// Vérification des champs
$nom = trim($data["nom"] ?? "");
$email = trim($data["email"] ?? "");
$numero = trim($data["numero"] ?? "");
$password = trim($data["password"] ?? "");

if (!$nom || !$email || !$numero || !$password) {
    echo json_encode(["status" => "error", "message" => "Tous les champs sont requis."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Adresse email invalide."]);
    exit;
}

// Vérifier si email existe déjà
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Cet email est déjà utilisé."]);
    exit;
}

$stmt->close();

// Hasher le mot de passe
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

// Insérer utilisateur
$stmt = $conn->prepare("INSERT INTO users (nom, email, numero, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssis", $nom, $email, $numero, $hashed_password);

if ($stmt->execute()) {

    echo json_encode(["status" => "success", "message" => "Inscription réussie."]);
} else {
    echo json_encode(["status" => "error", "message" => "Erreur d'enregistrement."]);
}
?>
