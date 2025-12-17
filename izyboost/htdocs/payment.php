Structure du projet :

- index.html
- paiement.php
- verif_statut.php
- db.php

Contenu des fichiers ci-dessous :

---------------
1. index.html
---------------


---------------
2. paiement.php
---------------

---------------
3. verif_statut.php
---------------

---------------
4. db.php
---------------

<?php
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
