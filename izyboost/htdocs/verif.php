<?php
session_start();
$user_id=$_SESSION('user_id');
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


// Configuration
$api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY'; // À remplacer par votre clé valide
$max_attempts = 60; // 1 minute max
$attempt = 0;
$last_status = null;

// Connexion à la base de données (optimisée pour les transactions)
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

$req=$pdo->prepare("SELECT *  FROM transactions WHERE user_id=? ORDER BY id DESC LIMIT 1");
$req->execute([$user_id]);
$last=$req->fetch(PDO::FETCH_ASSOC);

while ($attempt < $max_attempts) {
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
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false // À activer en production avec un certificat valide
        ]);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("Erreur réseau: ");
        }
        
        if ($http_code !== 200) {
            throw new Exception("Erreur veillez recommencer (Code )");
        }
        
        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Réponse JSON invalide");
        }
        
        // Vérification de la réponse
        if (!isset($result['data']['status'])) {
            throw new Exception("Réponse incomplète");
        }
        
        $current_status = $result['data']['status'];
        $status_message = $result['data']['status_message'] ?? 'En attente';
        
        // Envoyer une mise à jour seulement si le statut a changé
        if ($current_status !== $last_status) {
            sendEvent('progress', "Statut: $status_message", [
                // 'status' => $current_status,
                // 'details' => $result['data']
            ]);
            
            $last_status = $current_status;
        }
        
        // Si paiement réussi
        if ($current_status === 'SUCCESSFUL') {
            // Démarrer une transaction SQL
            $pdo->beginTransaction();
            
            try {
                // 1. Vérifier si la transaction n'a pas déjà été créditée
                $stmt = $pdo->prepare("SELECT credited FROM transactions WHERE id_mamoni = ? FOR UPDATE");
                $stmt->execute([$transaction_id]);
                $transaction = $stmt->fetch();
                
                if (!$transaction) {
                    throw new Exception("Transaction introuvable");
                }
                
                if ($transaction['credited'] == 1) {
                    throw new Exception("votre solde a deja ete mise ajour. ");
                }
                
                // 2. Mettre à jour le statut et marquer comme créditée
                $stmt = $pdo->prepare("UPDATE transactions SET statut = ?, credited = 1 WHERE id_mamoni = ?");
                $stmt->execute(['SUCCESSFUL', $transaction_id]);
                
                // 3. Récupérer les infos pour créditer le solde utilisateur
                $stmt = $pdo->prepare("SELECT user_id, amount FROM transactions WHERE id_mamoni = ?");
                $stmt->execute([$transaction_id]);
                $transaction = $stmt->fetch();
                
                if (!$transaction || !isset($transaction['user_id'])) {
                    throw new Exception("Données transaction incomplètes");
                }
                
                // 4. Mettre à jour le solde de l'utilisateur
                $stmt = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
                $stmt->execute([$transaction['amount'], $transaction['user_id']]);
                
                // 5. Valider toutes les modifications
                $pdo->commit();


                
                sendEvent('success', 'Paiement confirmé et compte crédité  avec success!', [
                    // 'transaction_id' => $transaction_id,
                    // 'user_id' => $transaction['user_id'],
                    // 'montant' => $transaction['amount'],
                    // 'confirmation' => $result['data']
                ]);

                
                break;
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        }
        
    } catch (Exception $e) {
        sendEvent('error', $e->getMessage());
    }
    
    // Attendre 1 seconde avant la prochaine vérification
    sleep(1);
}
?>












<?php

$user_id=$_SESSION['user_id'];
$stmt3 = $pdo->prepare("SELECT nom, email FROM users WHERE id = ?");
$stmt3->execute([$user_id]);
$user = $stmt3->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    throw new Exception('votre compte a ete deconnecter. veillez vous reconnecter avant de relancer la commande');
    exit;
}


// $transaction_id doit contenir l'identifiant de la transaction en cours (id_mamoni)
$stmt = $pdo->prepare("SELECT amount FROM transactions WHERE id_mamoni = ?");
$stmt->execute([$transaction_id]);
$transaction = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$transaction) {
    throw new Exception("Transaction introuvable");
}

$amount = $transaction['amount']; // montant de la transaction en cours

// Maintenant tu peux utiliser $montant, par ex. pour l'envoyer par mail


$nom = $user['nom'];
$email = $user['email'];

$data = [
    'nom'     => $nom,
    'email'   => $email,
    'body'    => '',
    'amount'=>$amount,
    'Subject' => "paiement reussi. merci de faire confiance a izyboost #",
    'AltBody' => "Bonjour $nom, votre paiement de FCFA est en cours de traitement.",
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
    $error = curl_error($ch);
    error_log("Erreur CURL : $error");
    sendEvent('erreur lors  du transfert du mail');
   
} else {
    sendEvent('mail de confirmation envoyer avec success');
}

curl_close($ch);
?>








<?php
if ($last_status !== 'SUCCESSFUL') {
    sendEvent('timeout', 'Délai de suivi dépassé', [
        'last_status' => $last_status ?? 'inconnu',
        'attempts' => $attempt
    ]);
}




?>







