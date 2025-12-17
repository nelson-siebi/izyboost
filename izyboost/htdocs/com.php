<?php
// Activer logs personnalisés
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/izyboost.log');
ini_set('display_errors', 0); // cacher erreurs à l'écran en prod

error_log("=== Nouvelle exécution du script ===");
error_log("=== Début commande ===");

header('Content-Type: application/json');
session_start();

// Configuration
define('DEBUG_MODE', true);
ini_set('display_errors', DEBUG_MODE ? '1' : '0');
ini_set('display_startup_errors', DEBUG_MODE ? '1' : '0');
error_reporting(DEBUG_MODE ? E_ALL : 0);

define('BOOSTCI_API_KEY', 'cdd7ebd69dfb01de8a2d2f0397061ede');
define('BOOSTCI_API_URL', 'https://boostci.com/api/v2');
define('USD_TO_FCFA', 600);
define('MAX_QUANTITY_LIMIT', 100000);

define('PROFIT_MARGIN', 1.39); // +30% de marge

// Fonction pour formater la réponse
function jsonResponse($success, $data = [], $error = '', $debug = []) {
    $response = [
        'success' => $success,
        'timestamp' => time()
    ];
    
    if ($success) {
        $response['data'] = $data;
    } else {
        $response['error'] = $error;
        if (DEBUG_MODE && !empty($debug)) {
            $response['debug'] = $debug;
        }
    }
    
    return json_encode($response);
}

// Connexion à la base de données
function connectDB() {
    try {
        $conn = new mysqli("sql310.infinityfree.com", "if0_39106178", "RTNrS9RYwvPu", "if0_39106178_izyboost");
        
        if ($conn->connect_errno) {
            throw new Exception("Erreur de connexion DB: " . $conn->connect_error, $conn->connect_errno);
        }
        
        if (!$conn->set_charset("utf8mb4")) {
            throw new Exception("Erreur charset DB: " . $conn->error);
        }
        
        return $conn;
    } catch (Exception $e) {
        die(jsonResponse(false, [], "Échec connexion base de données", [
            'error' => $e->getMessage(),
            'code' => $e->getCode()
        ]));
    }
}

// Appel API sécurisé
function callBoostciAPI($action, $params = []) {
    try {
        $params['key'] = BOOSTCI_API_KEY;
        $params['action'] = $action;
        
        $url = BOOSTCI_API_URL . '?' . http_build_query($params);
        
        $options = [
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n",
                'timeout' => 15,
                'ignore_errors' => true
            ]
        ];
        
        $context = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        
        if ($response === false) {
            $error = error_get_last();
            throw new Exception("API inaccessible", 0, [
                'url' => $url,
                'error' => $error['message'] ?? 'Unknown',
                'headers' => $http_response_header ?? []
            ]);
        }
        
        if (strpos($response, '<html><body><script') !== false) {
            throw new Exception("Protection anti-bot détectée", 403);
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Réponse API invalide", 0, [
                'raw' => $response,
                'error' => json_last_error_msg()
            ]);
        }
        
        if (isset($data['error'])) {
            throw new Exception($data['error'], $data['code'] ?? 0);
        }
        
        return $data;
    } catch (Exception $e) {
        throw new Exception("Erreur API: " . $e->getMessage(), $e->getCode(), $e->getPrevious());
    }
}

// Gestion des actions
try {
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    switch ($action) {
        case 'services':
            $services = callBoostciAPI('services');

            foreach ($services as &$service) {
                if (isset($service['rate'])) {
                    // 1. Appliquer ta marge (ex. +32 %)
                    $rate_usd = $service['rate'] * 1.21;

                    // 2. Convertir en FCFA
                    $rate_fcfa = $rate_usd * USD_TO_FCFA;

                    // 3. Arrondir le résultat en FCFA
                    $service['rate'] = round($rate_fcfa, 3);
                }
            }
            unset($service); // Important: libérer la référence

            echo jsonResponse(true, ['services' => $services]);
            break;

        case 'add':
            $conn = connectDB();
            
            error_log("🎯 ===== NOUVELLE COMMANDE DÉBUT =====");
            error_log("👤 User ID: " . ($_SESSION['user_id'] ?? 'NON DÉFINI'));
            
            // Validation des données
            $required = ['service', 'link', 'quantity', 'user_id'];
            $missing = array_diff($required, array_keys($_POST));
            
            if (!empty($missing)) {
                throw new Exception("Paramètres manquants: " . implode(', ', $missing), 400);
            }
            
            $service_id = $_POST['service'];
            $link = filter_var($_POST['link'], FILTER_VALIDATE_URL);
            $quantity = intval($_POST['quantity']);
            $user_id = $_SESSION['user_id'];
            
            if (!$link) throw new Exception("URL invalide", 400);
            if ($quantity <= 0 || $quantity > MAX_QUANTITY_LIMIT) throw new Exception("Quantité invalide", 400);
            
            // Récupération du service
            $services = callBoostciAPI('services');
            $selected = null;
            
            foreach ($services as $s) {
                if ($s['service'] == $service_id) {
                    $selected = $s;
                    break;
                }
            }
            if (!$selected) throw new Exception("Service introuvable", 404);
            if ($quantity < $selected['min'] || $quantity > $selected['max']) throw new Exception("Quantité hors limites", 400);
            
            // LOG: Vérification solde AVANT (en FCFA) et récupération email
            error_log("💰 ===== VÉRIFICATION SOLDE AVANT COMMANDE =====");
            
            $stmt = $conn->prepare("SELECT solde, email FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $stmt->bind_result($solde_avant_fcfa, $user_email);
            $stmt->fetch();
            $stmt->close();
            
            error_log("💵 Solde AVANT commande: " . $solde_avant_fcfa . " FCFA");
            error_log("📧 Email utilisateur: " . ($user_email ?? 'NON TROUVÉ'));
            
            // CALCUL CORRECT : USD → FCFA
            error_log("🧮 ===== CALCUL DU MONTANT EN FCFA =====");
            error_log("📊 Rate API original: " . $selected['rate'] . " USD");
            
            // 1. Rate API en USD
            $rate_usd = $selected['rate'];
            error_log("💰 Rate USD: " . $rate_usd . " USD");
            
            // 2. Appliquer marge
            $rate_usd_with_margin = $rate_usd * 1.30;
            error_log("📈 Rate avec marge 30%: " . $rate_usd_with_margin . " USD");
            
            // 3. Convertir en FCFA
            $rate_fcfa = $rate_usd_with_margin * USD_TO_FCFA;
            error_log("💳 Rate en FCFA: " . $rate_fcfa . " FCFA");
            
            // 4. Calcul du total en FCFA
            $total_fcfa = ceil(($rate_fcfa * $quantity) / 1000);

            error_log("💸 Total FCFA: (" . $rate_fcfa . " * " . $quantity . ") / 1000 = " . $total_fcfa . " FCFA");
            
            // 5. Convertir en USD pour l'API
            $total_usd = $total_fcfa / USD_TO_FCFA;
            error_log("🔁 Total USD (pour API): " . $total_usd . " USD");
            
            error_log("⚖️ Vérification: Solde FCFA (" . $solde_avant_fcfa . ") >= Total FCFA (" . $total_fcfa . ") ? " . ($solde_avant_fcfa >= $total_fcfa ? 'OUI ✅' : 'NON ❌'));
            
            if ($solde_avant_fcfa < $total_fcfa) {
                error_log("🚫 ERREUR: Solde FCFA insuffisant!");
                throw new Exception("Solde insuffisant", 402);
            }
            
            // DÉBUT TRANSACTION
            $conn->begin_transaction();
            
            try {
                // MISE À JOUR SOLDE EN FCFA
                error_log("🔄 ===== MISE À JOUR SOLDE EN FCFA =====");
                
                $stmt = $conn->prepare("UPDATE users SET solde = solde - ? WHERE id = ?");
                $stmt->bind_param("di", $total_fcfa, $user_id);
                $stmt->execute();
                
                $lignes_affectees = $stmt->affected_rows;
                $stmt->close();
                
                error_log("📝 Requête UPDATE FCFA:");
                error_log("   - Montant à déduire: " . $total_fcfa . " FCFA");
                error_log("   - User ID: " . $user_id);
                error_log("   - Lignes affectées: " . $lignes_affectees);
                
                // Vérification solde APRÈS
                $stmt = $conn->prepare("SELECT solde FROM users WHERE id = ?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $stmt->bind_result($solde_apres_fcfa);
                $stmt->fetch();
                $stmt->close();
                
                error_log("💵 Solde APRÈS déduction: " . $solde_apres_fcfa . " FCFA");
                error_log("📉 Différence: " . ($solde_avant_fcfa - $solde_apres_fcfa) . " FCFA");
                
                $api_success = false;
                $api_order_id = null;
                
                try {
                    $order = callBoostciAPI('add', [
                        'service' => $service_id,
                        'link' => $link,
                        'quantity' => $quantity
                    ]);
                    
                    $api_order_id = $order['order'] ?? null;
                    
                    if (!empty($api_order_id)) {
                        $api_success = true;
                        // Enregistrement en base
                        $stmt = $conn->prepare("INSERT INTO commandes (user_id, service, lien, quantite, total, api_order_id, statut) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
                        $stmt->bind_param("isssds", $user_id, $selected['name'], $link, $quantity, $total_usd, $api_order_id);
                        $stmt->execute();
                        $stmt->close();
                        error_log("✅ Commande API créée - Order ID: " . $api_order_id);
                    }
                } catch (Exception $apiError) {
                    // API échoue - on enregistre en attente
                    $api_order_id = 'ATT-' . time() . '-' . bin2hex(random_bytes(2));
                    $stmt = $conn->prepare("INSERT INTO attente (service, lien, quantite, api_order_id, total, user_id) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->bind_param("ssisdi", $selected['name'], $link, $quantity, $api_order_id, $total_usd, $user_id);
                    $stmt->execute();
                    $stmt->close();
                    $api_success = false;
                    
                    error_log("⚠️ Commande en attente - Order ID: " . $api_order_id);
                    
                    // ENVOI EMAIL POUR COMMANDE EN ATTENTE
                    try {
                        $mail_data = [
                            'nom' => "Client IzyBoost",
                            'email' => $user_email ?: "nelsonsiebi@gmail.com", // Email utilisateur ou fallback
                            'lien' => $link,
                            'quantite' => $quantity,
                            'service' => $selected['name'],
                            'Subject' => "Commande en attente - IzyBoost",
                            'amount' => $total_fcfa,
                            'AltBody' => "Bonjour, votre commande pour {$selected['name']} est en attente. Nous traitons le problème et vous tiendrons informé. Détails: Lien: $link, Quantité: $quantity, Montant: $total_usd USD",
                            'type' => 'attente'
                        ];

                        $ch = curl_init('https://izyboost.wuaze.com/form/projet1/send_mail_api.php');
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $mail_data);
                        $mail_response = curl_exec($ch);
                        curl_close($ch);
                        
                        error_log("📧 Email envoyé pour commande en attente à: " . $mail_data['email']);
                    } catch (Exception $e) {
                        error_log("❌ Erreur envoi mail: " . $e->getMessage());
                    }
                }
                
                $conn->commit();
                
                error_log("🎉 ===== COMMANDE FINALISÉE =====");
                error_log("📋 Résumé FCFA:");
                error_log("   - Solde initial: " . $solde_avant_fcfa . " FCFA");
                error_log("   - Montant déduit: " . $total_fcfa . " FCFA");
                error_log("   - Solde final: " . $solde_apres_fcfa . " FCFA");
                error_log("   - Statut: " . ($api_success ? 'SUCCESS' : 'PENDING'));
                
                echo jsonResponse(true, [
                    'order_id' => $api_order_id,
                    'total_fcfa' => round($total_fcfa, 0),
                    'service' => $selected['name'],
                    'status' => $api_success ? 'success' : 'pending',
                    'message' => $api_success ? 'Commande créée avec succès' : 'Commande enregistrée en attente'
                ]);
                
            } catch (Exception $e) {
                $conn->rollback();
                error_log("❌ ERREUR TRANSACTION: " . $e->getMessage());
                throw $e;
            }
            break;
            
        default:
            throw new Exception("Action non reconnue", 400);
    }
} catch (Exception $e) {
    $debug = DEBUG_MODE ? [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ] : [];
    
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    
    echo jsonResponse(false, [], $e->getMessage(), $debug);
}
?>