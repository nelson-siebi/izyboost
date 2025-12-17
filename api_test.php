<?php
/**
 * IzyBoost API - Fichier de Test Complet
 * 
 * Ce fichier contient tous les endpoints de l'API avec :
 * - Les données à envoyer
 * - Les réponses attendues
 * - Des exemples de test
 */

// Configuration
define('API_BASE_URL', 'http://localhost:8000/api');
define('API_V1_URL', 'http://localhost:8000/api/v1');

// Variables globales pour les tests
$authToken = null;
$apiKey = null;
$userId = null;

/**
 * Fonction helper pour faire des requêtes HTTP
 */
function makeRequest($method, $url, $data = null, $headers = []) {
    $ch = curl_init();
    
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $defaultHeaders = ['Content-Type: application/json'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

echo "=== IZYBOOST API - TESTS COMPLETS ===\n\n";

// ============================================
// 1. AUTHENTIFICATION
// ============================================
echo "--- 1. AUTHENTIFICATION ---\n\n";

// 1.1 Inscription
echo "1.1 Inscription\n";
$registerData = [
    'username' => 'testuser_' . time(),
    'email' => 'test_' . time() . '@example.com',
    'password' => 'Password123!',
    'password_confirmation' => 'Password123!',
    'sponsor_code' => null // Optionnel
];
echo "Données envoyées : " . json_encode($registerData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/register', $registerData);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

if ($response['code'] == 201) {
    $authToken = $response['body']['access_token'];
    $userId = $response['body']['user']['id'];
}

// 1.2 Connexion
echo "1.2 Connexion\n";
$loginData = [
    'email_or_username' => $registerData['email'],
    'password' => 'Password123!'
];
echo "Données envoyées : " . json_encode($loginData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/login', $loginData);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

if ($response['code'] == 200) {
    $authToken = $response['body']['access_token'];
}

// 1.3 Profil utilisateur
echo "1.3 Profil utilisateur\n";
$response = makeRequest('GET', API_BASE_URL . '/me', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 2. SERVICES
// ============================================
echo "--- 2. SERVICES ---\n\n";

// 2.1 Lister tous les services
echo "2.1 Lister tous les services\n";
$response = makeRequest('GET', API_BASE_URL . '/services');
echo "Réponse attendue (200) : Services groupés par catégorie\n";
echo json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 3. COMMANDES
// ============================================
echo "--- 3. COMMANDES ---\n\n";

// 3.1 Créer une commande
echo "3.1 Créer une commande\n";
$orderData = [
    'service_id' => 1, // ID du service
    'link' => 'https://instagram.com/testuser',
    'quantity' => 100
];
echo "Données envoyées : " . json_encode($orderData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/user/orders', $orderData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201 ou 422 si solde insuffisant) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 3.2 Lister mes commandes
echo "3.2 Lister mes commandes\n";
$response = makeRequest('GET', API_BASE_URL . '/user/orders', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 3.3 Détails d'une commande
echo "3.3 Détails d'une commande\n";
$orderUuid = 'uuid-de-la-commande'; // Remplacer par un UUID réel
$response = makeRequest('GET', API_BASE_URL . "/user/orders/$orderUuid", null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 4. WALLET & FINANCE
// ============================================
echo "--- 4. WALLET & FINANCE ---\n\n";

// 4.1 Consulter le solde
echo "4.1 Consulter le solde\n";
$response = makeRequest('GET', API_BASE_URL . '/wallet', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 4.2 Historique des transactions
echo "4.2 Historique des transactions\n";
$response = makeRequest('GET', API_BASE_URL . '/wallet/transactions?page=1&per_page=20', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 4.3 Méthodes de dépôt
echo "4.3 Méthodes de dépôt\n";
$response = makeRequest('GET', API_BASE_URL . '/wallet/deposit-methods');
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 4.4 Initier un dépôt
echo "4.4 Initier un dépôt\n";
$depositData = [
    'payment_method_id' => 1,
    'amount' => 10000
];
echo "Données envoyées : " . json_encode($depositData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/wallet/deposit', $depositData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 5. WHITE LABEL
// ============================================
echo "--- 5. WHITE LABEL ---\n\n";

// 5.1 Lister les plans
echo "5.1 Lister les plans\n";
$response = makeRequest('GET', API_BASE_URL . '/white-label/plans', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 5.2 Lister les templates
echo "5.2 Lister les templates\n";
$response = makeRequest('GET', API_BASE_URL . '/white-label/templates', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 5.3 Acheter un site
echo "5.3 Acheter un site\n";
$purchaseData = [
    'plan_id' => 1,
    'template_id' => 1,
    'site_name' => 'Mon Site SMM',
    'subdomain' => 'monsite',
    'interval' => 'monthly'
];
echo "Données envoyées : " . json_encode($purchaseData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/white-label/purchase', $purchaseData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 5.4 Mes sites
echo "5.4 Mes sites\n";
$response = makeRequest('GET', API_BASE_URL . '/white-label/sites', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 5.5 Modifier le branding
echo "5.5 Modifier le branding\n";
$siteUuid = 'uuid-du-site'; // Remplacer
$brandingData = [
    'logo' => 'https://example.com/logo.png',
    'primary_color' => '#667eea',
    'secondary_color' => '#764ba2'
];
echo "Données envoyées : " . json_encode($brandingData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('PUT', API_BASE_URL . "/white-label/sites/$siteUuid/branding", $brandingData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 6. PARRAINAGE
// ============================================
echo "--- 6. PARRAINAGE ---\n\n";

// 6.1 Statistiques de parrainage
echo "6.1 Statistiques de parrainage\n";
$response = makeRequest('GET', API_BASE_URL . '/referrals/stats', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 6.2 Liste des filleuls
echo "6.2 Liste des filleuls\n";
$response = makeRequest('GET', API_BASE_URL . '/referrals/list', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 6.3 Historique des commissions
echo "6.3 Historique des commissions\n";
$response = makeRequest('GET', API_BASE_URL . '/referrals/commissions', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 6.4 Lien de parrainage
echo "6.4 Lien de parrainage\n";
$response = makeRequest('GET', API_BASE_URL . '/referrals/link', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 7. SUPPORT
// ============================================
echo "--- 7. SUPPORT ---\n\n";

// 7.1 Créer un ticket
echo "7.1 Créer un ticket\n";
$ticketData = [
    'subject' => 'Problème de commande',
    'department' => 'technical',
    'priority' => 'medium',
    'message' => 'Ma commande ne fonctionne pas'
];
echo "Données envoyées : " . json_encode($ticketData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/tickets', $ticketData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 7.2 Mes tickets
echo "7.2 Mes tickets\n";
$response = makeRequest('GET', API_BASE_URL . '/tickets', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 7.3 Répondre à un ticket
echo "7.3 Répondre à un ticket\n";
$ticketUuid = 'uuid-du-ticket'; // Remplacer
$replyData = [
    'message' => 'Voici plus de détails...'
];
echo "Données envoyées : " . json_encode($replyData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . "/tickets/$ticketUuid/reply", $replyData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 8. NOTIFICATIONS
// ============================================
echo "--- 8. NOTIFICATIONS ---\n\n";

// 8.1 Liste des notifications
echo "8.1 Liste des notifications\n";
$response = makeRequest('GET', API_BASE_URL . '/notifications', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 8.2 Nombre de non lues
echo "8.2 Nombre de non lues\n";
$response = makeRequest('GET', API_BASE_URL . '/notifications/unread-count', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 8.3 Marquer comme lu
echo "8.3 Marquer comme lu\n";
$notifId = 1; // Remplacer
$response = makeRequest('POST', API_BASE_URL . "/notifications/$notifId/read", null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 9. API DÉVELOPPEURS - GESTION CLÉS
// ============================================
echo "--- 9. API DÉVELOPPEURS - GESTION CLÉS ---\n\n";

// 9.1 Créer une clé API
echo "9.1 Créer une clé API\n";
$apiKeyData = [
    'name' => 'Ma Clé API',
    'permissions' => ['services.read', 'orders.create', 'orders.read', 'balance.read']
];
echo "Données envoyées : " . json_encode($apiKeyData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . '/user/api-keys', $apiKeyData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

if ($response['code'] == 201) {
    $apiKey = $response['body']['api_key']['key'];
}

// 9.2 Lister mes clés API
echo "9.2 Lister mes clés API\n";
$response = makeRequest('GET', API_BASE_URL . '/user/api-keys', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 10. API PUBLIQUE V1 (AVEC CLÉ API)
// ============================================
echo "--- 10. API PUBLIQUE V1 (AVEC CLÉ API) ---\n\n";

if ($apiKey) {
    // 10.1 Services (API v1)
    echo "10.1 Services (API v1)\n";
    $response = makeRequest('GET', API_V1_URL . '/services', null, [
        "X-API-Key: $apiKey"
    ]);
    echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

    // 10.2 Créer une commande (API v1)
    echo "10.2 Créer une commande (API v1)\n";
    $orderData = [
        'service_id' => 1,
        'link' => 'https://instagram.com/apitest',
        'quantity' => 50
    ];
    echo "Données envoyées : " . json_encode($orderData, JSON_PRETTY_PRINT) . "\n";

    $response = makeRequest('POST', API_V1_URL . '/orders', $orderData, [
        "X-API-Key: $apiKey"
    ]);
    echo "Réponse attendue (201) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

    // 10.3 Liste des commandes (API v1)
    echo "10.3 Liste des commandes (API v1)\n";
    $response = makeRequest('GET', API_V1_URL . '/orders', null, [
        "X-API-Key: $apiKey"
    ]);
    echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

    // 10.4 Solde (API v1)
    echo "10.4 Solde (API v1)\n";
    $response = makeRequest('GET', API_V1_URL . '/balance', null, [
        "X-API-Key: $apiKey"
    ]);
    echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";
}

// ============================================
// 11. ADMIN (NÉCESSITE RÔLE ADMIN)
// ============================================
echo "--- 11. ADMIN (NÉCESSITE RÔLE ADMIN) ---\n\n";

// 11.1 Dashboard
echo "11.1 Dashboard\n";
$response = makeRequest('GET', API_BASE_URL . '/admin/dashboard', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin, 403 sinon) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 11.2 Liste des utilisateurs
echo "11.2 Liste des utilisateurs\n";
$response = makeRequest('GET', API_BASE_URL . '/admin/users?page=1', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 11.3 Ajuster le solde d'un utilisateur
echo "11.3 Ajuster le solde d'un utilisateur\n";
$balanceData = [
    'amount' => 1000,
    'type' => 'add',
    'reason' => 'Bonus de bienvenue'
];
echo "Données envoyées : " . json_encode($balanceData, JSON_PRETTY_PRINT) . "\n";

$response = makeRequest('POST', API_BASE_URL . "/admin/users/$userId/adjust-balance", $balanceData, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 11.4 Rembourser une commande
echo "11.4 Rembourser une commande\n";
$orderId = 1; // Remplacer
$response = makeRequest('POST', API_BASE_URL . "/admin/orders/$orderId/refund", null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 11.5 Statistiques financières
echo "11.5 Statistiques financières\n";
$response = makeRequest('GET', API_BASE_URL . '/admin/finance/stats?period=month', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// 11.6 Synchroniser les services
echo "11.6 Synchroniser les services\n";
$response = makeRequest('POST', API_BASE_URL . '/admin/services/sync', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200 si admin) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

// ============================================
// 12. DÉCONNEXION
// ============================================
echo "--- 12. DÉCONNEXION ---\n\n";

echo "12.1 Déconnexion\n";
$response = makeRequest('POST', API_BASE_URL . '/logout', null, [
    "Authorization: Bearer $authToken"
]);
echo "Réponse attendue (200) : " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n";

echo "=== FIN DES TESTS ===\n";
