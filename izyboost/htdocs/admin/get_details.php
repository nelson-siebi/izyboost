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

// Sécurité: vérifier que la table est autorisée
$allowed_tables = ['commandes', 'users', 'vraies_commandes'];
if(!in_array($table, $allowed_tables)) {
    die("Table non autorisée");
}

$query = $db->query("SELECT * FROM $table WHERE id = $id");
if(!$query || $query->num_rows === 0) {
    die("Aucune donnée trouvée");
}

$row = $query->fetch_assoc();

echo '<div class="detail-grid">';
foreach($row as $key => $value) {
    echo '<div class="detail-item">';
    echo '<label>' . htmlspecialchars($key) . '</label>';
    echo '<div class="value">' . htmlspecialchars($value) . '</div>';
    echo '</div>';
}
echo '</div>';

$db->close();
?>