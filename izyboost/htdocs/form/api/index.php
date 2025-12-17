<?php
header("Content-Type: application/json; charset=UTF-8");

require_once('functions.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['nom']) && isset($_POST['numero'])) {
        $nom = htmlspecialchars($_POST['nom'], ENT_QUOTES, 'UTF-8');
        $numero = htmlspecialchars($_POST['numero'], ENT_QUOTES, 'UTF-8');
        $numero=int($numero);
        $response = initiate_pay($nom, $numero);

        echo json_encode($response);
        
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "Paramètres manquants"
        ]);
    }
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Méthode non autorisée"
    ]);
}
echo"salut";
?>
