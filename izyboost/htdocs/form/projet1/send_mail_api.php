<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';
header('Content-Type: application/json');

$nom     = $_POST['nom']     ?? '';
$email   = $_POST['email']   ?? '';
$subject = $_POST['Subject'] ?? '';
$amount  = $_POST['amount']??'';
$lien   =$_POST['lien'] ??'';
$message=$_POST['message']??'bienvenue sur izyboost. profitez de notre super promo de cette semaine . tapez simplement izyboost sur votre recherche google et choisissez le premier site.';
$service=$_POST['service']??'';
$quantite=$_POST['quantite']??'';
$altBody = $_POST['AltBody'] ?? '';
$type    = $_POST['type']    ?? 'verification'; 
$nom_expediteur=$POST['nom_expediteur']??'';


if (!$nom || !$email || !$subject || !$altBody) {
    echo json_encode(['success' => false, 'message' => 'Champs requis manquants']);
    exit;
}

include 'db.php';
$pdo = db_connect();
// if($type==='verification'){




// Charger le template selon le type
ob_start();
switch ($type) {
    case 'bienvenue':
       
        include 'templates_mail/welcome.php';
        break;
    case 'reset':
        include 'templates_mail/reset_password.php';
        break;
    case 'init_pay':
        include 'templates_mail/init_pay.php';
        break;
    case 'success_pay':
        include 'templates_mail/success_pay.php';
        break;
        case 'failled_pay':
            include 'templates_mail/failled_pay.php';
            break;
    case 'verification':
    default:
     
        include 'templates_mail/email_template.php';
        break;
         case 'failled_pay':
            include 'templates_mail/failled_pay.php';
            break;
            case 'attente':
            include 'templates_mail/attente.php';
            break;
            case 'message':
            echo$message??"nous vous enverons un mail pour vous notifier tres bientot";
            break;
}
$body = ob_get_clean();

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'nelsonsiebi237@gmail.com';
    $mail->Password = 'alco hnzu ijog cyaq';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;
    $nom_expediteur = trim($nom_expediteur ?? '');
    $expediteur = $nom_expediteur !== '' ? $nom_expediteur : 'IZYBOOST';
    $mail->setFrom('nelsonsiebi237@gmail.com', $expediteur);

    // $mail->setFrom('nelsonsiebi237@gmail.com', 'IZYBOOST');
    $mail->addAddress($email, $nom);

    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body    = $body;
    $mail->AltBody = $altBody;

    $mail->send();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
}
