<?php
// test_email_api_improved.php

// URL de l'API (à adapter)
$api_url = 'https://izyboost.wuaze.com/form/projet1/send_mail_api.php'; // Remplacez par le vrai chemin

// Données de test
$post_data = [
    'nom' => 'Test User',
    'email' => 'nelsonsiebi@gmail.com',
    'Subject' => 'demande de renseignement',
    'amount' => '500',
    'AltBody' => 'nexius ai',
    'type' => 'init_pay'
];

// Initialisation cURL
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $api_url,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query($post_data),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true, // Inclure les headers dans la réponse
    CURLOPT_SSL_VERIFYPEER => false, // Pour debug seulement - à désactiver en production
    CURLOPT_TIMEOUT => 10,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/x-www-form-urlencoded',
        'Expect:'
    ]
]);

// Exécution
$response = curl_exec($ch);

// Debug complet
echo "<h2>Debug Information</h2>";
echo "<h3>Request Info:</h3>";
echo "<pre>";
print_r(curl_getinfo($ch));
echo "</pre>";

if (curl_errno($ch)) {
    echo "<h3>cURL Error:</h3>";
    echo curl_error($ch);
} else {
    // Séparation header/body
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $header_size);
    $body = substr($response, $header_size);
    
    echo "<h3>Response Headers:</h3>";
    echo "<pre>" . htmlspecialchars($headers) . "</pre>";
    
    echo "<h3>Response Body:</h3>";
    if (empty($body)) {
        echo "La réponse est vide";
    } else {
        echo "<pre>" . htmlspecialchars($body) . "</pre>";
        
        // Tentative de décodage JSON
        $decoded = json_decode($body, true);
        echo "<h3>Decoded JSON:</h3>";
        if (json_last_error() === JSON_ERROR_NONE) {
            print_r($decoded);
        } else {
            echo "Erreur de décodage JSON: " . json_last_error_msg();
            echo "<br>Contenu brut: " . $body;
        }
    }
}

curl_close($ch);
?>