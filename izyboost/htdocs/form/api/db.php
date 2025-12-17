
 <?php
function db_connect(){
    
$host='localhost';
$dbname='test';
$username='root';
$password='';
try{

    $pdo=new PDO("mysql:host=$host;dbname=$dbname",$username,'');
    // erreurs
    $pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);
    return $pdo;

}catch(PDOException $e){
    echo"erreur de connexion a la base de donnee:".$e->getMessage();


}


}


?>
