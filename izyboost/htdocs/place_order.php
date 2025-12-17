<?php

session_start();
$conn = new mysqli("sql310.infinityfree.com", "if0_39106178", "RTNrS9RYwvPu", "if0_39106178_izyboost");

if ($conn->connect_error) {
    die("Connexion échouée : " . $conn->connect_error);
}

$utilisateur_id = $_SESSION['user_id'] ?? null;
$service = $_POST['service'] ?? null;
$link = $_POST['link'] ?? null;
$quantity = intval($_POST['quantity'] ?? 0);
$rate = floatval($_POST['rate'] ?? 0);
$total = round(($quantity / 1000) * $rate, 2);

if (!$utilisateur_id || !$service || !$link || !$quantity || !$rate || !$total) {
    http_response_code(400);
    echo json_encode(['error' => 'Champs requis manquants']);
    exit;
}

// Vérification du solde
$sql = "SELECT solde FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $utilisateur_id);
$stmt->execute();
$stmt->bind_result($solde);
$stmt->fetch();
$stmt->close();

if ($solde < $total) {
    echo json_encode(["success" => false, "message" => "Solde insuffisant"]);
    exit;
}

// Appel API BoostCI
$api_key = 'FUSSpUe2cP0TiZE4otbfaCedUIgYo8dXQGiHmB2OMuJF52Zp3t9xmFGsyk4Q';
$postdata = [
    'key' => $api_key,
    'action' => 'add',
    'service' => $service,
    'link' => $link,
    'quantity' => $quantity
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($postdata)
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents("https://boostci.com/api/v2", false, $context);
$response = json_decode($result, true);

if (isset($response['order'])) {
    $api_order_id = $response['order'];

    // Enregistrement de la commande
    $sql = "INSERT INTO commandes (user_id, service, lien, quantite, total, api_order_id, date)
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisids", $utilisateur_id, $service, $link, $quantity, $total, $api_order_id);
    $stmt->execute();
    $stmt->close();

    // Mise à jour du solde
    $sql = "UPDATE users SET solde = solde - ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("di", $total, $utilisateur_id);
    $stmt->execute();
    $stmt->close();








    
    echo json_encode(["success" => true, "message" => "Commande créée", "order" => $api_order_id]);
} else {
    $orders="infinity";
    echo json_encode(["success" => true, "message" => "commande cree avec success", "order" => $orders]);
    $orders="en attente";
   
    $sql2 = "INSERT INTO attente (id, service, lien, quantite, total, api_order_id, date)
            VALUES (?, ?, ?, ?, ?, ?, NOW())";
    $stmt2 = $conn->prepare($sql);
    $stmt2->bind_param("iisids", $utilisateur_id, $service, $link, $quantity, $total, $orders);
    $stmt2->execute();
    $stmt2->close()

    // Mise à jour du solde
    $sql2 = "UPDATE users SET solde = solde - ? WHERE id = ?";
    $stmt2 = $conn->prepare($sql);
    $stmt2->bind_param("di", $total, $utilisateur_id);
    $stmt2->execute();
    $stmt2->close();
     
}

