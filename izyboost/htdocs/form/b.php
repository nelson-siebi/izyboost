<?php
session_start();
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
ob_end_clean();

function sendEvent($status, $message, $data = []) {
    $payload = [
        'status' => $status,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ];
    
    echo "data: " . json_encode($payload) . "\n\n";
    ob_flush();
    flush();
}

// Validation de l'ID de transaction
$transaction_id = $_GET['transaction_id'] ?? null;
if (empty($transaction_id)) {
    sendEvent('error', 'ID de transaction manquant');
    exit;
}

sendEvent('progress', 'Démarrage du suivi', ['transaction_id' => $transaction_id]);

// Configuration
$api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY';
$max_attempts = 30; // 1 minute max
$attempt = 0;
$last_status = null;

// Connexion à la base de données
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    sendEvent('error', 'Erreur de connexion à la base de données');
    exit;
}

$payment_successful = false;

while ($attempt < $max_attempts && !$payment_successful) {
    $attempt++;
    
    try {
        // Requête à l'API Mamonipay
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://mamonipay.me/api/transaction/payment_status',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['gateway_reference' => $transaction_id]),
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $api_key,
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            CURLOPT_TIMEOUT => 30, // ✅ Augmenter à 30 secondes
   			CURLOPT_CONNECTTIMEOUT => 15, // ✅ Ajouter timeout connexion
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
if ($error) {
    // Gestion spécifique des timeouts
    if (strpos($error, 'timed out') !== false) {
        throw new Exception("L'API met trop de temps à répondre. Nouvelle tentative dans 1 seconde...");
    } else {
        throw new Exception("Erreur réseau: " . $error);
    }
}
        
        if ($http_code !== 200) {
            throw new Exception("Erreur veillez recommencer (Code $http_code)");
        }
        
        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Réponse JSON invalide");
        }
        
        // Vérification de la réponse
        if (!isset($result['data']['status'])) {
            throw new Exception("Réponse incomplète de l'API");
        }
        
        $current_status = $result['data']['status'];
        $status_message = $result['data']['status_message'] ?? 'En attente';
        
        // Envoyer une mise à jour seulement si le statut a changé
        if ($current_status !== $last_status) {
            sendEvent('progress', "Statut: $status_message", [
                'status' => $current_status,
                'attempt' => $attempt
            ]);
            
            $last_status = $current_status;
        }
        
        // Si paiement réussi
        if ($current_status === 'SUCCESSFUL') {
            $pdo->beginTransaction();
            
            try {
                // 1. Vérifier si la transaction n'a pas déjà été créditée
                $stmt = $pdo->prepare("SELECT credited, user_id, amount FROM transactions WHERE id_mamoni = ? FOR UPDATE");
                $stmt->execute([$transaction_id]);
                $transaction = $stmt->fetch();
                
                if (!$transaction) {
                    throw new Exception("Transaction introuvable");
                }
                
                if ($transaction['credited'] == 1) {
                    sendEvent('success', 'Votre solde a déjà été mise à jour.');
                    $pdo->commit();
                    $payment_successful = true;
                    break;
                }
                
                // 2. Mettre à jour le statut et marquer comme créditée
                $stmt = $pdo->prepare("UPDATE transactions SET statut = ?, credited = 1 WHERE id_mamoni = ?");
                $stmt->execute(['SUCCESSFUL', $transaction_id]);
                
                $user_id = $transaction['user_id'];
                $amount = $transaction['amount'];
                
                if (!$user_id) {
                    throw new Exception("Données transaction incomplètes");
                }
                
                // 3. Mettre à jour le solde de l'utilisateur
                $stmt = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
                $stmt->execute([$amount, $user_id]);
                
                // 4. Valider toutes les modifications
                $pdo->commit();
                
                sendEvent('success', 'Paiement confirmé et compte crédité avec succès!', [
                    'transaction_id' => $transaction_id,
                    'montant' => $amount
                ]);
                
                // 🔥 CORRECTION : Envoyer l'email APRÈS la validation de la transaction
                try {
                    $stmt3 = $pdo->prepare("SELECT nom, email FROM users WHERE id = ?");
                    $stmt3->execute([$user_id]);
                    $user = $stmt3->fetch(PDO::FETCH_ASSOC);
                    
                    if ($user) {
                        $nom = $user['nom'];
                        $email = $user['email'];
                        
                        $data = [
                            'nom'     => $nom,
                            'email'   => $email,
                            'body'    => '',
                            'amount'  => $amount,
                            'Subject' => "Paiement réussi - Merci de faire confiance à IzyBoost",
                            'AltBody' => "Bonjour $nom, votre paiement de $amount FCFA a été confirmé avec succès. Votre compte a été crédité.",
                            'type'    => 'success_pay'
                        ];
                        
                        $mail_api_url = "https://izyboost.wuaze.com/form/projet1/send_mail_api.php";
                        
                        $ch = curl_init($mail_api_url);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_POST, true);
                        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 15);
                        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
                        
                        $response = curl_exec($ch);
                        
                        if ($response === false) {
                            error_log("Erreur CURL email: " . curl_error($ch));
                            sendEvent('info', 'Email de confirmation non envoyé (erreur technique)');
                        } else {
                            sendEvent('info', 'Email de confirmation envoyé avec succès');
                        }
                        
                        curl_close($ch);
                    }
                } catch (Exception $emailError) {
                    // Ne pas bloquer le processus pour une erreur d'email
                    error_log("Erreur envoi email: " . $emailError->getMessage());
                    sendEvent('info', 'Email non envoyé (erreur technique)');
                }
                
                $payment_successful = true;
                break;
                
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        }
        
        // Si paiement échoué
        if ($current_status === 'FAILED') {
            sendEvent('error', 'Paiement échoué. Veuillez réessayer.');
            break;
        }
        
    } catch (Exception $e) {
        sendEvent('error', $e->getMessage());
        // Continuer malgré l'erreur pour les prochaines tentatives
    }
    
    // Attendre 1 seconde avant la prochaine vérification
    sleep(2);
}

// 🔥 CORRECTION : Vérifier si le paiement n'a pas abouti
if (!$payment_successful && $last_status !== 'SUCCESSFUL') {
    sendEvent('timeout', 'Délai de suivi dépassé. Vérifiez ultérieurement le statut de votre paiement.', [
        'last_status' => $last_status ?? 'inconnu',
        'attempts' => $attempt
    ]);
}

// 🔥 CORRECTION : Envoyer un événement de fin
echo "event: complete\n";
echo "data: " . json_encode([
    'status' => $payment_successful ? 'success' : 'timeout',
    'message' => 'Processus de suivi terminé'
]) . "\n\n";
ob_flush();
flush();
?>