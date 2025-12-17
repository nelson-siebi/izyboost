<?php
session_start();
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('X-Accel-Buffering: no');

// Désactiver la compression
if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', '1');
}
ini_set('zlib.output_compression', '0');
ini_set('implicit_flush', '1');

ob_end_clean();
ob_implicit_flush(true);

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
    
    error_log("SSE Event: $status - $message");
}

// Vérifier que l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    sendEvent('error', 'Utilisateur non connecté');
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

if ($action !== 'verify_transactions') {
    sendEvent('error', 'Action non valide');
    exit;
}

sendEvent('progress', ' Démarrage de la vérification...');

// Connexion à la base de données
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    sendEvent('progress', ' Connexion àu server izyboost reussi');
} catch (Exception $e) {
    sendEvent('error', ' Erreur de connexion à la base de données: ' . $e->getMessage());
    exit;
}

// Clé API Mamoni
$api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY';

try {
    // Récupérer les transactions non échouées de l'utilisateur
$stmt = $pdo->prepare("
    SELECT id, id_mamoni, amount, statut, credited, date
    FROM transactions
    WHERE user_id = ?
      AND credited = 0
      AND statut NOT IN ('FAILED', 'CANCELLED', 'EXPIRED')
    ORDER BY id DESC
    LIMIT 10
");

    $stmt->execute([$user_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendEvent('progress', '📊 Recherche des transactions terminée', [
        'total_transactions' => count($transactions)
    ]);

    if (empty($transactions)) {
        sendEvent('success', ' Aucune transaction à vérifier');
        sendFinalEvent();
        exit;
    }

    $transactions_traitees = 0;
    $transactions_mises_a_jour = 0;
    $solde_total_credite = 0;

    foreach ($transactions as $transaction) {
        $transactions_traitees++;
        $transaction_id = $transaction['id'];
        $mamoni_id = $transaction['id_mamoni'];
        $amount = $transaction['amount'];
        $ancien_statut = $transaction['statut'];

        sendEvent('progress', " Vérification de la transaction #$mamoni_id", [
            'transaction_id' => $mamoni_id,
            'progression' => "$transactions_traitees/" . count($transactions)
        ]);

        // Petite pause
        usleep(500000);

        try {
            // Appel à l'API Mamoni
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => 'https://mamonipay.me/api/transaction/payment_status',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode(['gateway_reference' => $mamoni_id]),
                CURLOPT_HTTPHEADER => [
                    'Authorization: Bearer ' . $api_key,
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                CURLOPT_TIMEOUT => 15,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => false
            ]);

            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curl_error = curl_error($ch);
            curl_close($ch);

            if ($curl_error) {
                sendEvent('warning', "⚠️ Transaction #$mamoni_id - Erreur réseau");
                continue;
            }

            if ($http_code !== 200) {
                sendEvent('warning', "⚠️ Transaction #$mamoni_id - Code HTTP: $http_code");
                continue;
            }

            $result = json_decode($response, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                sendEvent('warning', "⚠️ Transaction #$mamoni_id - JSON invalide");
                continue;
            }

            if (!isset($result['data']['status'])) {
                sendEvent('warning', "⚠️ Transaction #$mamoni_id - Statut manquant");
                continue;
            }

            $nouveau_statut = $result['data']['status'];
            $status_message = $result['data']['status_message'] ?? '';

            // Démarrer une transaction SQL
            $pdo->beginTransaction();

            try {
                // 🔥 CORRECTION : Mettre à jour seulement le statut (sans status_message)
                $update_stmt = $pdo->prepare("
                    UPDATE transactions 
                    SET statut = ? 
                    WHERE id = ? AND user_id = ?
                ");
                $update_stmt->execute([$nouveau_statut, $transaction_id, $user_id]);

                // Si paiement réussi et pas encore crédité
                if ($nouveau_statut === 'SUCCESSFUL' && $transaction['credited'] == 0) {
                    
                    // Créditer le solde
                    $solde_stmt = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
                    $solde_stmt->execute([$amount, $user_id]);
                    
                    // Marquer comme créditée
                    $credited_stmt = $pdo->prepare("UPDATE transactions SET credited = 1 WHERE id = ?");
                    $credited_stmt->execute([$transaction_id]);
                    
                    $solde_total_credite += $amount;
                    $transactions_mises_a_jour++;

                    // Récupérer le nouveau solde
                    $solde_stmt = $pdo->prepare("SELECT solde FROM users WHERE id = ?");
                    $solde_stmt->execute([$user_id]);
                    $user_solde = $solde_stmt->fetchColumn();

                    sendEvent('success', " Transaction confirmée! +$amount FCFA crédités", [
                        'montant_credite' => $amount,
                        'nouveau_solde' => $user_solde,
                        'transaction_id' => $mamoni_id
                    ]);

                } elseif ($ancien_statut !== $nouveau_statut) {
                    sendEvent('info', "📝 Statut mis à jour: $ancien_statut → $nouveau_statut");
                    $transactions_mises_a_jour++;
                } else {
                    sendEvent('info', "ℹ️ Statut inchangé: $nouveau_statut");
                }

                $pdo->commit();

            } catch (Exception $e) {
                $pdo->rollBack();
                sendEvent('error', "❌ Erreur base de données: " . $e->getMessage());
            }

        } catch (Exception $e) {
            sendEvent('error', "❌ Erreur lors de la vérification: " . $e->getMessage());
        }
    }

    // Résumé final
    sendEvent('complete', '🎉 Vérification terminée!', [
        'transactions_traitees' => $transactions_traitees,
        'transactions_mises_a_jour' => $transactions_mises_a_jour,
        'solde_total_credite' => $solde_total_credite
    ]);

    sendFinalEvent();

} catch (Exception $e) {
    sendEvent('error', '❌ Erreur générale: ' . $e->getMessage());
    sendFinalEvent();
}

function sendFinalEvent() {
    echo "event: complete\n";
    echo "data: " . json_encode([
        'status' => 'complete',
        'message' => 'Processus terminé'
    ]) . "\n\n";
    ob_flush();
    flush();
    exit;
}
?>