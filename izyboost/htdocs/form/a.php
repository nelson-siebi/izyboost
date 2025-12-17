<?php
session_start();
$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Utilisateur non connecté']);
    exit;
}

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
ob_implicit_flush(true);
ob_end_flush();

function push($message, $data = [], $status = 'progress') {
    $payload = [
        'status' => $status,
        'message' => $message,
        'data' => $data,
        'timestamp' => microtime(true)
    ];
    echo "data: " . json_encode($payload) . "\n\n";
    ob_flush();
    flush();
    usleep(100000);
}

// Validation des données...
$amount = filter_input(INPUT_GET, 'amount', FILTER_VALIDATE_INT) ?? null;
$numero = filter_input(INPUT_GET, 'numero', FILTER_SANITIZE_STRING) ?? null;
$nom = filter_input(INPUT_GET, 'nom', FILTER_SANITIZE_STRING) ?? 'utilisateur';

if (!$amount || $amount < 100) {
    push("Le montant doit être d'au moins 100 FCFA", [], 'error');
    exit;
}

if (!$numero || !preg_match('/^[0-9]{9,15}$/', $numero)) {
    push("Numéro de téléphone invalide", [], 'error');
    exit;
}

$order_id = 'mamoni_' . time() . '_' . bin2hex(random_bytes(4));
$order_id = substr($order_id, 0, 50);

push("Initialisation du paiement de {$amount} FCFA...");

try {
    // Initialisation du paiement Mamoni...
    $payment_data = [
        "amount" => $amount,
        "phone" => $numero,
        "external_reference" => $order_id,
        "client_fees_rate" => 100,
        "metadata" => [
            "user_id" => $user_id,
            "user_name" => $nom,
            "amount" => $amount
        ]
    ];

    push("Préparation des données de paiement...", ['order_id' => $order_id]);

    $api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY';
    
    $curl = curl_init();
    $api_url = 'https://mamonipay.me/api/transaction/init_payment';

    curl_setopt_array($curl, [
        CURLOPT_URL => $api_url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_POSTFIELDS => json_encode($payment_data),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $api_key,
            'Content-Type: application/json',
            'Accept: application/json',
            'X-Request-Id: ' . $order_id
        ]
    ]);

    push("Traitement de la commande en cours...");

    $response = curl_exec($curl);
    $error = curl_error($curl);
    $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);

    if ($error) throw new Exception("Erreur cURL : $error");
    if ($httpcode !== 200) throw new Exception("Le serveur ne répond pas");

    $result = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Erreur de décodage JSON");
    }

    $mamoni_id = $result['data']['gateway_reference'] ?? null;
    if (!$mamoni_id) throw new Exception("Échec de l'initialisation");

    push("Paiement en attente de confirmation. Veuillez entrer votre code PIN...*126# ou encore #150#");

    // Connexion BD et enregistrement...
    try {
        $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (Exception $e) {
        throw new Exception("Erreur de connexion BD");
    }

    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (order_id, user_id, statut, date, amount, numero, id_mamoni) 
        VALUES (?, ?, ?, NOW(), ?, ?, ?)
    ");
    $stmt->execute([
        $order_id, $user_id, $result['data']['status'] ?? 'PENDING', $amount, $numero, $mamoni_id
    ]);

    // Envoi email...
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
            'Subject' => "Initiation de votre paiement #" . $order_id,
            'AltBody' => "Bonjour $nom, votre paiement de $amount FCFA est en cours.",
            'type'    => 'init_pay'
        ];

        $mail_api_url = "https://izyboost.wuaze.com/form/projet1/send_mail_api.php";

        $ch = curl_init($mail_api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $response = curl_exec($ch);

        if ($response === false) {
            error_log("Erreur email: " . curl_error($ch));
            push('Email non envoyé (erreur technique)', [], 'warning');
        } else {
            push('Email de confirmation envoyé avec succès');
        }

        curl_close($ch);
    }

    $pdo->commit();

    push("Paiement initié avec succès. Veuillez confirmer avec votre code PIN", [
        'order_id' => $order_id,
        'mamoni_id' => $mamoni_id
    ], 'success');

    // 🔥 CORRECTION : Délai puis envoi de la redirection
    usleep(1000000); // 1 seconde
    
    echo "event: redirect\n";
    echo "data: " . json_encode([
        'data' => [
            'redirect_url' => "form/b.html?transaction_id=" . urlencode($mamoni_id),
            'countdown' => 6
        ]
    ]) . "\n\n";
    ob_flush();
    flush();
    
    usleep(500000);
    
    echo "event: complete\n";
    echo "data: " . json_encode([
        'status' => 'complete',
        'message' => 'Processus terminé'
    ]) . "\n\n";
    ob_flush();
    flush();
    
    usleep(300000);
    exit;

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    push("❌ " . $e->getMessage(), [], 'error');
    
    usleep(500000);
    echo "event: complete\n";
    echo "data: " . json_encode([
        'status' => 'error',
        'message' => 'Processus terminé avec erreur'
    ]) . "\n\n";
    ob_flush();
    flush();
    usleep(300000);
    exit;
}