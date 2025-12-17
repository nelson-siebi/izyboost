<?php
// Dans config.php, ajoutez ceci en haut
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__.'/php_errors.log');
// Configuration de la base de données
define('DB_HOST', 'sql310.infinityfree.com');
define('DB_NAME', 'if0_39106178_izyboost');
define('DB_USER', 'if0_39106178');
define('DB_PASS', 'RTNrS9RYwvPu');

// Clé API Mamonipay
define('MAMONI_API_KEY', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiYjgzYzczMzc3ZWI1ZWM0NjcwNjBkMDBmOTMzZGEzODk2MDgwNzdjNmQwYjQyNGIwNGYwYzhhNGFkYWNjY2FlMzUyMTY1ZmQzMTVlYWU2MzMiLCJpYXQiOjE3NTIxNzc0OTcuMTAzMzU5OTM3NjY3ODQ2Njc5Njg3NSwibmJmIjoxNzUyMTc3NDk3LjEwMzM2MDg5MTM0MjE2MzA4NTkzNzUsImV4cCI6MTc4MzcxMzQ5Ny4xMDAwNDcxMTE1MTEyMzA0Njg3NSwic3ViIjoiODcyIiwic2NvcGVzIjpbXX0.BdBQzBJWVcHw2LoYyiu9YiCBoyLPEmdPG855VqiJK-3Mha5MD3Vih3GEeHVX9crkEXEdvvIVEEmmv9UPyy4hUZfEKzfXe0QQbDXIa4AwSzBlZFLs-5Y44-GrPnqFslvLxd7yleeCBMpV_0NQ5Uw_zLhb3gmkbJHjKzcNfr-peVqoKrn2xkjhQVOvFjlpLRtxhxyZ96hFxjCV3miUeMUtCkdYvngcX1EPWH-EDZEC9D5cdK9v-AtAYrW5Xm-mEvjtz2W-1sEWBdc_DRMebW_iwjbyuWJ1y0zhYyDl0r4uHkuHb7-d8X5rQQDGasbpgPHwaz4xYvBusE1WyZjsxYco24VUFz-vn5iW2RSkSMcgfKU4oTel9oyWluZGvVmWaLsIbHjMjGFoV-Vrc3EvCqPNkR2DtIqT1bP_A4cAkvw7YGCDaODDT_23PK22iKPZXLrA1mHRCh9muAAX6VmkZgl33tMpjDQ03INCuwjNm57oV4JGjE7EBWx4EVuObX51WYr_cmSjfCSgWpQ5Z3QrSPihkp2iTkxtu3QO1qqyimpftwoh2-5N2y5P72Rhm3HKxq7_pL_kFuxfA1cLBCDMXFx0WNqueR3DO1jxDMgG--pdWKgrPNczTJ_isT0LY7_T0dcZoKqEl1nna9KFDveBYDhB-7WjK4031NpMQkjdA4yKGsY'); // Votre clé complète ici

// Configuration des erreurs
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-errors.log');