
<?php
session_start();
include 'db.php';
$user_id = $_SESSION['user_id'];
$gateway_reference = $_POST['gateway_reference'];

$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://mamonipay.me/api/transaction/payment_status',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode(['gateway_reference' => $gateway_reference]),
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer VOTRE_TOKEN_ICI',
    'Content-Type: application/json'
  ],
));

$response = curl_exec($curl);
curl_close($curl);
$data = json_decode($response, true);

if ($data && $data['success']) {
  $status = $data['data']['status'];
  $external_reference = $data['data']['external_reference'];
  $amount = $data['data']['amount'];

  $stmt = $pdo->prepare("UPDATE transactions SET status = ? WHERE gateway_reference = ?");
  $stmt->execute([$status, $gateway_reference]);

  if ($status === 'SUCCESS') {
    $stmt = $pdo->prepare("UPDATE users SET solde = solde + ? WHERE id = ?");
    $stmt->execute([$amount, $user_id]);
  }

  echo json_encode(['status' => $status]);
} else {
  echo json_encode(['status' => 'FAILED']);
}
