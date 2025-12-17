<?php
$conn=new MySQLi('localhost','root','','izyboosts');
if($conn){
    echo"connexion reussite";
}else{
    echo"echec";
}

define('FAPSHI_API_USER', '40e9f600-dd4f-4d36-8aef-9f50d9c81ae6');
define('FAPSHI_API_KEY', 'FAK_TEST_8c49ba1b4f806f8abdf2');

