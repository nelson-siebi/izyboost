<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://sandbox.mamonipay.me/api/auth/registration");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, FALSE);

curl_setopt($ch, CURLOPT_POST, TRUE);

curl_setopt($ch, CURLOPT_POSTFIELDS, "{
  \"name\": \"Mamoni\",
  \"phone\": \"690444433\",
  \"user_name\": \"mamoni_finance\",
  \"email\": \"exemple@gmail.org\",
  \"app_id\": \"=6B1Gc>OzkNxIuw|zI)j.S44e\",
  \"password\": \"secretpassword\",
  \"password_confirmation\": \"secretpassword\"
}");

curl_setopt($ch, CURLOPT_HTTPHEADER, array(
  "Content-Type: application/json"
));

$response = curl_exec($ch);
curl_close($ch);

var_dump($response);
?>