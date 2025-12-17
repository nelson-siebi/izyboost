<?php
session_start();
header('Content-Type: application/json');
require 'db.php';

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Utilisateur non connecté']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Vérifier les champs obligatoires
if (!isset($data['amount'], $data['name'], $data['phone'], $data['method'])) {
    echo json_encode(['error' => 'Données manquantes']);
    exit;
}

$amount = intval($data['amount']);
$name = htmlspecialchars($data['name']);
$email = 'nelsonsiebi@gmail.com';
$phone = htmlspecialchars($data['phone']);
$method = htmlspecialchars($data['method']);
$user_id = $_SESSION['user_id'];

// Validation supplémentaire
if ($amount < 100) {
    echo json_encode(['error' => 'Le montant minimum est de 100 FCFA']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['error' => 'Email invalide']);
    exit;
}

// 1. Créer la commande dans la base avec statut 'pending'
try {
    $stmt = $pdo->prepare("INSERT INTO commande (user_id, nom, email, phone, montant, methode, statut, date_commande) 
                          VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())");
    $stmt->execute([$user_id, $name, $email, $phone, $amount, $method]);
    
    $commandeId = $pdo->lastInsertId();
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erreur base de données: '.$e->getMessage()]);
    exit;
}

// 2. Appeler l'API Fapshi
$payload = json_encode([
    'amount' => $amount,
    'redirectUrl' => "https://izyboost.wuaze.com/verification.php?id=$commandeId",
    'message' => "Paiement IZYBOOST pour $name",
    'externalId' => "CMD_$commandeId"
]);

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => 'https://live.fapshi.com/initiate-pay',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'apikey: FAK_a309b1f93405db50b06870b4b5fba9c3',
        'apiuser: 0dd8a1bd-6bcf-41ce-9b3c-150774d51e99'
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($curl);
$curlError = curl_error($curl);
curl_close($curl);

if ($curlError) {
    // Marquer la commande comme erreur
    $pdo->prepare("UPDATE commande SET statut = 'failed' WHERE id = ?")->execute([$commandeId]);
    
    echo json_encode(['error' => 'Erreur cURL : ' . $curlError]);
    exit;
}

$result = json_decode($response, true);

// 3. Stocker le order_id dans la base de données si reçu
if (isset($result['transId'])) {
    $order_id = $result['transId'];
    
    try {
        $update = $pdo->prepare("UPDATE commande SET order_id = ? WHERE id = ?");
        $update->execute([$order_id, $commandeId]);
    } catch (PDOException $e) {
        error_log("Erreur mise à jour order_id: ".$e->getMessage());
    }
}

// 4. Retourner l'URL de paiement à l'utilisateur
if (isset($result['link'])) {
    echo json_encode([
        'success' => true,
        'paymentUrl' => $result['link'],
        'transId' => $result['transId'] ?? null,
        'order_id' => $order_id ?? null
    ]);
} else {
    // Marquer la commande comme erreur
    $pdo->prepare("UPDATE commande SET statut = 'failed' WHERE id = ?")->execute([$commandeId]);
    
    echo json_encode([
        'error' => 'Erreur API : ' . ($result['message'] ?? 'Inconnue'),
        'api_response' => $result
    ]);
}