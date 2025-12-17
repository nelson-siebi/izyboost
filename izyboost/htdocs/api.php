<?php
header('Content-Type: application/json');
require_once 'config2.php';

session_start();

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Non authentifié']);
    exit;
}

$action = $_GET['action'] ?? '';
$response = ['success' => false, 'message' => 'Action inconnue'];

try {
    $db = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME, DB_USER, DB_PASS);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupérer les données POST
    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'check_balance':
            // Vérifier que le solde est suffisant
            $amount = floatval($data['amount']);
            
            $stmt = $db->prepare("SELECT balance FROM users WHERE id = :user_id");
            $stmt->execute([':user_id' => $_SESSION['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && $user['balance'] >= $amount) {
                $response = ['success' => true];
            } else {
                $response = ['success' => false, 'message' => 'Solde insuffisant'];
            }
            break;

        case 'create_order':
            // Créer une nouvelle commande
            $stmt = $db->prepare("
                INSERT INTO orders 
                (user_id, service_id, service_name, quantity, url, unit_price, total_price, status, created_at) 
                VALUES 
                (:user_id, :service_id, :service_name, :quantity, :url, :unit_price, :total_price, 'pending', NOW())
            ");
            
            $stmt->execute([
                ':user_id' => $_SESSION['user_id'],
                ':service_id' => $data['service_id'],
                ':service_name' => $data['service_name'],
                ':quantity' => $data['quantity'],
                ':url' => $data['url'],
                ':unit_price' => $data['unit_price'],
                ':total_price' => $data['total_price']
            ]);
            
            $orderId = $db->lastInsertId();
            $response = ['success' => true, 'orderId' => $orderId];
            break;

        case 'save_api_order_id':
            // Sauvegarder l'ID de commande de l'API externe
            $stmt = $db->prepare("UPDATE orders SET api_order_id = :api_order_id WHERE id = :order_id");
            $stmt->execute([
                ':api_order_id' => $data['api_order_id'],
                ':order_id' => $data['order_id']
            ]);
            $response = ['success' => true];
            break;

        case 'update_order_status':
            // Mettre à jour le statut d'une commande
            $stmt = $db->prepare("UPDATE orders SET status = :status WHERE id = :order_id");
            $stmt->execute([
                ':status' => $data['status'],
                ':order_id' => $data['order_id']
            ]);
            
            // Si la commande est terminée, déduire le montant du solde
            if ($data['status'] === 'completed') {
                $stmt = $db->prepare("
                    UPDATE users u
                    JOIN orders o ON u.id = o.user_id
                    SET u.balance = u.balance - o.total_price
                    WHERE o.id = :order_id
                ");
                $stmt->execute([':order_id' => $data['order_id']]);
            }
            
            $response = ['success' => true];
            break;

        default:
            $response = ['success' => false, 'message' => 'Action non reconnue'];
    }

} catch (PDOException $e) {
    $response = ['success' => false, 'message' => 'Erreur base de données: ' . $e->getMessage()];
}

echo json_encode($response);