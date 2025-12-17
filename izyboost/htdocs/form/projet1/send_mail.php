<?php

use PHPMailer\PHPMailer\PHPMailer;

use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);


try {
    
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';  
    $mail->SMTPAuth = true;
    $mail->Username = 'nelsonsiebi237@gmail.com'; 
    $mail->Password = 'alco hnzu ijog cyaq'; 
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Destinataires
    $mail->setFrom('nelsonsiebi237@gmail.com', 'nexius ai');
    $mail->addAddress('junior1009f@gmail.com', 'nelson siebi');

    // Contenu du message
    $mail->isHTML(true);
    $mail->Subject = 'verification izyboost (nexius ai)';
    $mail->Body    = "";
    $mail->AltBody = 'Ceci est un test avec PHPMailer';

    $mail->send();

    echo 'Email envoyé avec succès ✅';

} catch (Exception $e) {

    echo "Erreur lors de l’envoi : {$mail->ErrorInfo}";

}
