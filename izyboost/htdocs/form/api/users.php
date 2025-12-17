<?php
include('db.php');
$pdo=db_connect();
$selection="SELECT* FROM users ";
$affichage=$pdo->prepare($selection);
$affichage->execute();
if($affichage->fetch()){

    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        
    </head>
    <body>
        <table border="2px">
            
            <tr>
                <td>nom</td>
                <td>numero</td>
                 <td>id</td>
                   <td>date</td> 
            </tr>
            <?php    foreach($affichage as $afficher){
                ?>
            <tr>
                <td><?php echo$afficher['nom'];?> </td>
                <td><?php echo $afficher['numero'];?></td>
                <td><?php echo $afficher['id'];?>></td>
                <td><?php echo $afficher['date'];?> <button>modifier</button></td>
           </tr><?php    };?> 
            
        </table>
    </body>
    </html>

    <?php
}else{
    echo'echouer';
}

?>