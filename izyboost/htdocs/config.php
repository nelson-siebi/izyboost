<?php
// Clé API Fapshi
define("FAPSHI_API_USER", "40e9f600-dd4f-4d36-8aef-9f50d9c81ae6");
define("FAPSHI_API_KEY", "FAK_TEST_8c49ba1b4f806f8abdf2");

// URL API
define("FAPSHI_INIT_URL", "https://sandbox.fapshi.com/initiate-pay");
define("FAPSHI_VERIFY_URL", "https://sandbox.fapshi.com/payment-status/"); // + transId

define('BASE_URL', 'http://' . $_SERVER['HTTP_HOST']);

// Activer le logging des erreurs
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');
?>