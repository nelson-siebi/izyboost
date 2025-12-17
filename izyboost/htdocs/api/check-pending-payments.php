<?php
session_start();
header('Content-Type: application/json');
require '../db.php';

// 1. Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'Non autorisé']);
    exit;
}

$user_id = $_SESSION['user_id'];

// 2. Récupérer les commandes en attente de l'utilisateur
$stmt = $pdo->prepare("SELECT id, order_id, montant FROM commande 
                      WHERE user_id = ? AND statut = 'pending' 
                      ORDER BY date_commande DESC");
$stmt->execute([$user_id]);
$commandes = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($commandes)) {
    echo json_encode(['success' => true, 'message' => 'Aucun paiement en attente']);
    exit;
}

$successfulPayments = [];
$apiErrors = [];

foreach ($commandes as $commande) {
    // 3. Vérifier le statut auprès de Fapshi
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://live.fapshi.com/payment-status/{$commande['order_id']}",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_HTTPHEADER => [
            'apiuser: 32283458-2ebb-42a4-8bc0-0272650e29eb',
            'apikey: FAK_c62c591e44a7e181516710bd27afe9e4'
        ],
        CURLOPT_SSL_VERIFYPEER => false
    ]);

    $response = curl_exec($curl);
    $error = curl_error($curl);
    curl_close($curl);

    if ($error) {
        $apiErrors[] = 'Erreur cURL pour la commande '.$commande['id'].': '.$error;
        continue;
    }

    $result = json_decode($response, true);

    // 4. Traiter la réponse
    if (isset($result['status']) && $result['status'] === 'SUCCESSFUL') {
        // Mettre à jour la commande
        $update = $pdo->prepare("UPDATE commande SET statut = 'success' WHERE id = ?");
        $update->execute([$commande['id']]);
        
        // Mettre à jour le solde utilisateur
        $updateSolde = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
        $updateSolde->execute([$commande['montant'], $user_id]);
        
        $successfulPayments[] = [
            'id' => $commande['id'],
            'amount' => $commande['montant']
        ];
    }
}

if (!empty($successfulPayments)) {
    echo json_encode([
        'success' => true,
        'paymentStatus' => 'SUCCESSFUL',
        'message' => count($successfulPayments).' paiement(s) confirmé(s)',
        'payments' => $successfulPayments
    ]);
} elseif (!empty($apiErrors)) {
    echo json_encode([
        'error' => implode(', ', $apiErrors),
        'paymentStatus' => 'ERROR'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'paymentStatus' => 'PENDING',
        'message' => 'Paiement(s) toujours en attente'
    ]);
}