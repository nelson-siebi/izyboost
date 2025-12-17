<?php
// Configuration de la base de données
define('DB_HOST', 'sql310.infinityfree.com');
define('DB_USER', 'if0_39106178');
define('DB_NAME','if0_39106178_izyboost')
define('DB_PASS', 'RTNrS9RYwvPu');

// Clé API externe
define('API_KEY', 'FUSSpUe2cP0TiZE4otbfaCedUIgYo8dXQGiHmB2OMuJF52Zp3t9xmFGsyk4Q');

// Configuration des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Initialisation de la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>