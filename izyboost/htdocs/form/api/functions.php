<?php
require_once('db.php');

//inscription de l'utilisateur
// function create_user($nom, $numero) {
//     $pdo = db_connect();

    
//     $verif = 'SELECT * FROM users WHERE numero = ?';
//     $stmt = $pdo->prepare($verif);
//     $stmt->execute([$numero]);

//     if ($stmt->rowCount() > 0) {
//         return [
//             "status" => "false",
//             "message" => "L'utilisateur avec ce numéro existe déjà"
//         ];
//     }

 
//     $sql = "INSERT INTO users(nom, numero) VALUES (?, ?)";
//     $insert_user = $pdo->prepare($sql);

//     if ($insert_user->execute([$nom, $numero])) {
//         return [
//             "status" => "success",
//             "message" => "Bonjour $nom, votre numéro est $numero"
//         ];
//     } else {
//         return [
//             "status" => "error",
//             "message" => "Échec de l'insertion"
//         ];
//     }
// }



//affichons tout les utilisateurs

// function afficher(){

// $pdo = db_connect();
// $selection='SELECT* FROM users';
// $affichage=$pdo->prepare($selection);

// $affichage->execute();
// }

function initiate_pay(){
    $pdo=db_connect();










$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://mamonipay.me/api/transaction/init_payment',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{

    "amount": 1000,
    "phone": "237676676120",
    "external_reference": "c4de0e24-b1be-4aee-9d0d-1e7a3909ec16",
    "client_fees_rate":100

}',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY',
    'Content-Type: application/json',
    'Content-Type: application/json'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
if($response){
return [
            "status" => "success",
            "message" => "Bonjour $nom, votre numéro est $numero"
        ];

} else {
        return [
            "status" => "error",
            "message" => "Échec de l'insertion"
        ];
    }













}
?>
