<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

// Connexion PDO
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Erreur de connexion : ' . $e->getMessage()]);
    exit;
}

// Si requête AJAX de vérification du statut
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'check_status') {
    $gateway = $_POST['gateway_reference'] ?? '';
    $external = $_POST['external_reference'] ?? '';
    $user_id = $_POST['user_id'] ?? 0;

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://mamonipay.me/api/transaction/payment_status',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(["gateway_reference" => $gateway]),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer YOUR_TOKEN_ICI',
            'Content-Type: application/json'
        ]
    ]);

    $response = curl_exec($curl);
    curl_close($curl);

    // Log brute pour debug si erreur
    file_put_contents("log_response.txt", $response);

    $result = json_decode($response, true);

    if (is_array($result) && isset($result['success']) && $result['success']) {
        $status = $result['data']['status'];

        // Mise à jour du statut de transaction
        $stmt = $pdo->prepare("UPDATE transactions SET status = ?, updated_at = NOW() WHERE external_reference = ?");
        $stmt->execute([$status, $external]);

        // Mise à jour solde utilisateur si succès
        if ($status === 'SUCCESS') {
            $amount = $result['data']['amount'];
            $stmt = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
            $stmt->execute([$amount, $user_id]);
        }

        echo json_encode(['status' => $status]);
    } else {
        $msg = is_array($result) && isset($result['message']) ? $result['message'] : 'Réponse vide ou invalide';
        echo json_encode(['success' => false, 'message' => 'Échec vérification : ' . $msg]);
    }
    exit;
}

// Si requête AJAX d’initiation du paiement
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = $_POST['nom'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['numero'] ?? '';
    $montant = $_POST['montant'] ?? '';
    $external = uniqid('ext_', true);

    // Vérifie si utilisateur existe
    $stmt = $pdo->prepare("SELECT * FROM users WHERE numero = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        $stmt = $pdo->prepare("INSERT INTO users (nom, email, numero, solde, password, avatar) VALUES (?, ?, ?, 0, 'default', 0)");
        $stmt->execute([$nom, $email, $phone]);
        $user_id = $pdo->lastInsertId();
    } else {
        $user_id = $user['id'];
    }

    // Enregistre la transaction initialement
    $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, external_reference, status, phone_number) VALUES (?, ?, ?, 'PENDING', ?)");
    $stmt->execute([$user_id, $montant, $external, $phone]);

    // Initier le paiement via API
    $payload = json_encode([
        "amount" => (float)$montant,
        "phone" => $phone,
        "external_reference" => $external,
        "client_fees_rate" => 50
    ]);

    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => 'https://mamonipay.me/api/transaction/init_payment',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY',
            'Content-Type: application/json'
        ]
    ]);

    $response = curl_exec($curl);
    curl_close($curl);

    file_put_contents("log_response.txt", $response);

    $result = json_decode($response, true);

    if (is_array($result) && isset($result['success']) && $result['success']) {
        $gateway = $result['data']['gateway_reference'];
        $stmt = $pdo->prepare("UPDATE transactions SET gateway_reference = ? WHERE external_reference = ?");
        $stmt->execute([$gateway, $external]);

        echo json_encode([
            'success' => true,
            'message' => 'Paiement initié',
            'gateway_reference' => $gateway,
            'external_reference' => $external,
            'user_id' => $user_id
        ]);
    } else {
        $apiMessage = is_array($result) && isset($result['message']) ? $result['message'] : 'Réponse vide ou invalide de l’API';
        echo json_encode([
            'success' => false,
            'message' => 'Erreur API: ' . $apiMessage
        ]);
    }
}
