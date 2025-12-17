<?php
session_start();
$conn = new mysqli("localhost", "root", "", "izyboost");
if ($conn->connect_error) {
    die("Connexion échouée : " . $conn->connect_error);
}

$api_key = "FUSSpUe2cP0TiZE4otbfaCedUIgYo8dXQGiHmB2OMuJF52Zp3t9xmFGsyk4Q";

$user_id = $_SESSION['user_id'] ?? null;
if (!$user_id) {
    echo "❌ Utilisateur non connecté. Veuillez vous connecter pour mettre à jour les commandes.";
    exit;
}


$sql = "SELECT id, api_order_id FROM commandes WHERE user_id = ? ORDER BY date DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$commandes_mises_a_jour = 0;

while ($row = $result->fetch_assoc()) {
    $commande_id = $row['id'];
    $api_order_id = $row['api_order_id'];

    $url = "https://boostci.com/api/v2?action=status&order={$api_order_id}&key={$api_key}";
    $response = file_get_contents($url);

    if (!$response) {
        echo "❌ Erreur lors de l'appel à l'API pour la commande ID $commande_id.<br>";
        continue;
    }

    $data = json_decode($response, true);

    if (!isset($data['status'])) {
        echo "❌ Réponse API invalide pour la commande ID $commande_id. Réponse brute : $response<br>";
        continue;
    }

    $statut_exact = $data['status']; 

   
    $update = $conn->prepare("UPDATE commandes SET statut = ? WHERE id = ?");
    $update->bind_param("si", $statut_exact, $commande_id);

    if ($update->execute()) {
        $commandes_mises_a_jour++;
    }
}


echo "<h3>✅ $commandes_mises_a_jour commande(s) mise(s) à jour avec succès !</h3>";

$conn->close();
?>
