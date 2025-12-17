<?php
try {
    $mail_data = [
        'nom' => "utilisateur",
        'email' => "nelsonsiebi@gmail.com",
        'lien'=>$link;
        'quantite'=>$quantity;
        'service'=>$selected['name'];
        'Subject' => "Commande en attente : ",
        'amount' => $total_usd,
        'AltBody' => "Bonjour, votre commande est en attente. Montant:$total_usd",
        'type' => 'attente'
    ];

    $ch = curl_init('https://izyboost.wuaze.com/form/projet1/send_mail_api.php');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $mail_data);

    $mail_response = curl_exec($ch);
    curl_close($ch);

    // Optionnel : log
    // file_put_contents('mail_log.txt', $mail_response);
} catch (Exception $e) {
    error_log("Erreur envoi mail: " . $e->getMessage());
}


// Supprimé : $stmt->close(); s'il n'y a pas de requête préparée ici
?>
