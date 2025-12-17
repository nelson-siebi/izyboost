<?php
$api_key = 'FUSSpUe2cP0TiZE4otbfaCedUIgYo8dXQGiHmB2OMuJF52Zp3t9xmFGsyk4Q';

$ch = curl_init();

curl_setopt_array($ch, array(
    CURLOPT_URL => 'https://boostci.com/api/v2',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query([
        'key' => $api_key,
        'action' => 'services'
    ]),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/x-www-form-urlencoded'
    ],
    CURLOPT_SSL_VERIFYPEER => false,
));

$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    echo json_encode(['error' => $error]);
    exit;
}

$data = json_decode($response, true);

// Préparer la réponse adaptée pour le JavaScript
$services = [];

if (is_array($data)) {
    foreach ($data as $item) {
        if (
            isset($item['service'], $item['name'], $item['rate'], $item['min'], $item['max'])
        ) {
            $services[] = [
                'service' => $item['service'],
                'name'    => $item['name'],
                'rate'    => round($item['rate'] *1.3, 4), // tarif personnalisé
                'min'     => $item['min'],
                'max'     => $item['max']
            ];
        }
    }
}

header('Content-Type: application/json');
echo json_encode($services);
