<?php
session_start();
if(!isset($_SESSION['admin_logged_in'])) {
    die("Accès non autorisé");
}

// Connexion à la base de données
$db = new mysqli('sql310.infinityfree.com', 'if0_39106178', 'RTNrS9RYwvPu', 'if0_39106178_izyboost');
if($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$id = intval($_POST['id']);
$table = $_POST['table'];
$statut = $db->real_escape_string($_POST['statut']);

// Sécurité: vérifier que la table est autorisée
$allowed_tables = ['commande', 'commandes'];
if(!in_array($table, $allowed_tables)) {
    die("Table non autorisée");
}

// Vérifier que le statut est valide
$allowed_status = ['pending', 'completed', 'cancelled'];
if(!in_array($statut, $allowed_status)) {
    die("Statut non autorisé");
}

$query = $db->query("UPDATE $table SET statut = '$statut' WHERE id = $id");
if($query) {
    echo "success";
} else {
    echo "Erreur: " . $db->error;
}

$db->close();
?>