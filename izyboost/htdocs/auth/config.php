<?php
$host = "sql310.infinityfree.com";
$user = "if0_39106178";
$password = "RTNrS9RYwvPu"; // ou ton mot de passe MySQL
$dbname = "if0_39106178_izyboost"; // change le nom de la base

$conn = new mysqli($host, $user, $password, $dbname);

// Gestion d’erreur
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connexion à la base de données échouée."
    ]));
}

$conn->set_charset("utf8");
?>