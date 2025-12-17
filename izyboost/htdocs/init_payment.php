<?php
header('Content-Type: application/json');
require_once 'config.php';

// Récupérer les données POST
$data = json_decode(file_get_contents('php://input'), true);

// Validation des données
if (empty($data['amount']) || empty($data['phone']) || empty($data['operator'])) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'Données manquantes']));
}

$payload = [
    'amount' => (int)$data['amount'],
    'redirectUrl' => BASE_URL . '/confirmation.php',
    'message' => $data['message'] ?? 'Recharge de compte'
];

$url = 'https://sandbox.fapshi.com/initiate-pay';
$headers = [
    'Content-Type: application/json',
    'apiuser: ' . FAPSHI_API_USER,
    'apikey: ' . FAPSHI_API_KEY
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true); // Pour voir les headers complets

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Séparation du header et du body
$headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$headers = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);

curl_close($ch);

// Journalisation pour débogage
error_log("Fapshi Response Headers: " . $headers);
error_log("Fapshi Response Body: " . $body);

// Vérification du Content-Type
if (strpos($headers, 'application/json') === false) {
    http_response_code(500);
    die(json_encode([
        'success' => false,
        'message' => 'Réponse inattendue de l\'API',
        'raw_response' => $body
    ]));
}

$responseData = json_decode($body, true);

if ($httpCode === 200 && $responseData !== null) {
    echo json_encode(['success' => true, 'transId' => $responseData['transId']]);
} else {
    http_response_code($httpCode ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $responseData['message'] ?? 'Erreur API',
        'http_code' => $httpCode
    ]);
}
?>