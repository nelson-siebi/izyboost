
<?php
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
<?php
session_start();
$user_id=60;

$sql="SELECT solde FROM users WHERE user_id=?";
$stmt=$pdo->prepare($sql);
$stmt->execute([$user_id]);
if($stmt->fetch()){
    echo($stmt);
};
echo"d";
?>