<?php
header('Content-Type: text/plain');

$api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY';

$test_transaction_id = 'REQ25100311358LXGD2N';

echo "🧪 Test de l'API Mamoni\n";
echo "========================\n\n";

// Test 1: Vérification de base
echo "1. Test de connexion basique...\n";
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => 'https://mamonipay.me/api/transaction/payment_status',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode(['gateway_reference' => $test_transaction_id]),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $api_key,
        'Content-Type: application/json',
        'Accept: application/json',
        'User-Agent: IzyBoost/1.0'
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$total_time = curl_getinfo($ch, CURLINFO_TOTAL_TIME);
$error = curl_error($ch);
$errno = curl_errno($ch);

curl_close($ch);

echo "✅ Code HTTP: $http_code\n";
echo "✅ Temps de réponse: " . round($total_time, 2) . "s\n";

if ($error) {
    echo "❌ Erreur cURL: $error (Code: $errno)\n";
} else {
    echo "✅ Connexion réussie\n";
}

// Test 2: Analyse de la réponse
echo "\n2. Analyse de la réponse...\n";
if ($response) {
    $data = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ Format JSON valide\n";
        
        if (isset($data['data']['status'])) {
            echo "✅ Statut trouvé: " . $data['data']['status'] . "\n";
        } else {
            echo "❌ Statut non trouvé dans la réponse\n";
        }
        
        if (isset($data['data']['status_message'])) {
            echo "✅ Message: " . $data['data']['status_message'] . "\n";
        }
        
        // Afficher toute la réponse pour debug
        echo "\n📦 Réponse complète:\n";
        print_r($data);
        
    } else {
        echo "❌ JSON invalide: " . json_last_error_msg() . "\n";
        echo "📦 Réponse brute: " . substr($response, 0, 500) . "...\n";
    }
} else {
    echo "❌ Aucune réponse reçue\n";
}

// Test 3: Vérification DNS
echo "\n3. Test DNS...\n";
$dns_records = dns_get_record('mamonipay.me', DNS_A);
if ($dns_records) {
    echo "✅ DNS résolu: " . $dns_records[0]['ip'] . "\n";
} else {
    echo "❌ Impossible de résoudre mamonipay.me\n";
}

// Test 4: Test de ping (approximatif)
echo "\n4. Test de connectivité...\n";
$start = microtime(true);
$test_socket = @fsockopen('mamonipay.me', 443, $errno, $errstr, 10);
$end = microtime(true);

if ($test_socket) {
    echo "✅ Connecté à mamonipay.me:443 (" . round(($end - $start) * 1000) . "ms)\n";
    fclose($test_socket);
} else {
    echo "❌ Impossible de se connecter: $errstr (Code: $errno)\n";
}
?>