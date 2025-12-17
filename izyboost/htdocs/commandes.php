<?php 
include 'tracker.php';

session_start();
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Connexion à la base de données
$conn = new mysqli("sql310.infinityfree.com", "if0_39106178", "RTNrS9RYwvPu", "if0_39106178_izyboost");
if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

$api_key = "cdd7ebd69dfb01de8a2d2f0397061ede";
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    die(json_encode(['success' => false, 'message' => 'Utilisateur non connecté']));
}

// Vérifier si c'est une requête OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Fonction pour appeler l'API de statut
function getOrderStatus($api_order_id, $api_key) {
    $url = "https://boostci.com/api/v2?action=status&order={$api_order_id}&key={$api_key}";
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'ignore_errors' => true
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        return ['success' => false, 'error' => 'API inaccessible'];
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['success' => false, 'error' => 'Réponse API invalide'];
    }
    
    if (!isset($data['status'])) {
        return ['success' => false, 'error' => 'Statut non trouvé dans la réponse'];
    }
    
    return ['success' => true, 'status' => $data['status']];
}

// Mise à jour des statuts des commandes
$commandes_mises_a_jour = 0;
$errors = [];

// Récupérer les commandes avec statut non terminé
$sql = "SELECT id, api_order_id, statut 
        FROM commandes 
        WHERE user_id = ? 
        AND statut NOT IN ('Completed', 'Refunded', 'Canceled', 'Terminé', 'Annulé')
        ORDER BY date DESC";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Erreur préparation requête: ' . $conn->error]));
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $commande_id = $row['id'];
    $api_order_id = $row['api_order_id'];
    $ancien_statut = $row['statut'];
    
    $status_result = getOrderStatus($api_order_id, $api_key);
    
    if ($status_result['success']) {
        $nouveau_statut = $status_result['status'];
        
        // Mettre à jour seulement si le statut a changé
        if ($ancien_statut !== $nouveau_statut) {
            $update = $conn->prepare("UPDATE commandes SET statut = ? WHERE id = ?");
            $update->bind_param("si", $nouveau_statut, $commande_id);
            
            if ($update->execute()) {
                $commandes_mises_a_jour++;
                error_log("✅ Commande $commande_id mise à jour: $ancien_statut → $nouveau_statut");
            } else {
                $errors[] = "Erreur mise à jour commande $commande_id: " . $update->error;
            }
            $update->close();
        }
    } else {
        $errors[] = "Commande $commande_id: " . $status_result['error'];
    }
}
$stmt->close();

// Récupérer toutes les commandes pour l'affichage
$sql = "SELECT 
            id, 
            service, 
            lien AS url, 
            quantite AS quantity, 
            total, 
            api_order_id AS order_id,
            statut,
            DATE_FORMAT(date, '%d/%m/%Y %H:%i') AS formatted_date
        FROM commandes 
        WHERE user_id = ? 
        ORDER BY date DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    die(json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]));
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$commandes = [];
while ($row = $result->fetch_assoc()) {
    // Formater le total pour l'affichage
    $row['total_display'] = number_format($row['total'], 2) . ' USD';
    $commandes[] = $row;
}

$stmt->close();
$conn->close();

// Renvoyer les données au format JSON
echo json_encode([
    'success' => true,
    'data' => $commandes,
    'count' => count($commandes),
    'updated' => $commandes_mises_a_jour,
    'errors' => $errors,
    'message' => $commandes_mises_a_jour > 0 ? "$commandes_mises_a_jour commande(s) mise(s) à jour" : 'Aucune mise à jour nécessaire'
]);
?>