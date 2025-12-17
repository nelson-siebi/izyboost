<?php
<?php
$longueur=8
function genererChaineAleatoire($longueur) {
  return bin2hex(random_bytes($longueur / 2));
}

$chaineAleatoire = genererChaineAleatoire(16);
echo $chaineAleatoire;
?>
