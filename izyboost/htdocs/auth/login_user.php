<?php
header("Content-Type: application/json");
session_start();
require_once "config.php";

// Récupération des données JSON
$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data["email"] ?? "");
$password = trim($data["password"] ?? "");

if (!$email || !$password) {
    echo json_encode(["status" => "error", "message" => "Email et mot de passe requis."]);
    exit;
}
if(isset($_SESSION['user_id'])){
    header('location:accueil.php');

}

// Rechercher utilisateur
$stmt = $conn->prepare("SELECT id, nom, email, password, solde FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user["password"])) {
    echo json_encode(["status" => "error", "message" => "Email ou mot de passe incorrect."]);
    exit;
}

// Succès
$_SESSION['user_id']=$user['id'];
echo json_encode([
    "status" => "success",
    "message" => "Connexion réussie.",
    "user" => [
        "id" => $user["id"],
        "nom" => $user["nom"],
        "email" => $user["email"],
        "solde" => $user["solde"]
    ]
]);




?>

    

<?php

$user_id=$_SESSION['user_id'];

$nom = $user['nom'];
$email = $user['email'];

$data = [
    'nom'     => $nom,
    'email'   => $email,
    'body'    => '',
    'amount'=>'',
    'Subject' => "benvenue sur la plate forme izyboost le leader du digital et du boostage en ligne ",
    'AltBody' => "vous etes arrive sur izyboost au bon moment avec une super promotion de 30% de reduction",
    'type'    => 'bienvenue'
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


