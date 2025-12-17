








<?php

$user_id=10;
$stmt3 = $pdo->prepare("SELECT nom, email FROM users WHERE id = ?");
$stmt3->execute([$user_id]);
$user = $stmt3->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    throw new Exception('votre compte a ete deconnecter. veillez vous reconnecter avant de relancer la commande');
    exit;
}

$nom = $user['nom'];
$email = $user['email'];

$data = [
    'nom'     => $nom,
    'email'   => $email,
    'body'    => '',
    'amount'=>$amount,
    'Subject' => "Initiation de votre paiement #",
    'AltBody' => "Bonjour $nom, votre paiement de FCFA est en cours de traitement.",
    'type'    => 'success_pay'
];

$mail_api_url = "http://127.0.0.1/form/projet1/send_mail_api.php";

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




