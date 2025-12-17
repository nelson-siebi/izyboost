<?php
/****************************************************
 * Fichier : afficher_site_creation_requests.php
 * Objectif : Afficher tous les enregistrements
 *            de la table site_creation_requests
 ****************************************************/

// 🔧 CONFIGURATION DE LA BASE
$host = "sql310.infinityfree.com";
$dbname = "if0_39106178_izyboost";
$username = "if0_39106178";
$password = "RTNrS9RYwvPu";

try {
    // ✅ Connexion à la base
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "<h2>📂 Liste des enregistrements de <strong>site_creation_requests</strong></h2>";

    // 🔎 Récupération de tous les enregistrements
    $stmt = $pdo->query("SELECT * FROM site_creation_requests ORDER BY created_at DESC");

    // 🟢 Vérifier s’il y a des données
    if ($stmt->rowCount() > 0) {
        echo "<table border='1' cellpadding='6' cellspacing='0' style='border-collapse: collapse; width:100%; font-family:Arial, sans-serif;'>
                <thead style='background:#f2f2f2;'>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Nom du site</th>
                        <th>Description</th>
                        <th>Couleur</th>
                        <th>Type de domaine</th>
                        <th>Domaine perso</th>
                        <th>Logo</th>
                        <th>Fonctionnalités</th>
                        <th>Admin</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Pays</th>
                        <th>Méthode paiement</th>
                        <th>Prix total</th>
                        <th>Prix mensuel</th>
                        <th>Status</th>
                        <th>Créé le</th>
                        <th>Mis à jour</th>
                    </tr>
                </thead>
                <tbody>";

        // 🔁 Afficher chaque enregistrement
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>
                    <td>{$row['id']}</td>
                    <td>{$row['user_id']}</td>
                    <td>" . htmlspecialchars($row['site_name']) . "</td>
                    <td>" . htmlspecialchars($row['site_description']) . "</td>
                    <td>{$row['site_color']}</td>
                    <td>{$row['domain_type']}</td>
                    <td>" . htmlspecialchars($row['custom_domain']) . "</td>
                    <td>" . htmlspecialchars($row['logo_filename']) . "</td>
                    <td><pre style='white-space:pre-wrap; font-size:12px;'>" . htmlspecialchars($row['features']) . "</pre></td>
                    <td>" . htmlspecialchars($row['admin_name']) . "</td>
                    <td>{$row['admin_email']}</td>
                    <td>{$row['admin_phone']}</td>
                    <td>{$row['admin_country']}</td>
                    <td>{$row['payment_method']}</td>
                    <td>{$row['total_price']} FCFA</td>
                    <td>{$row['monthly_price']} FCFA</td>
                    <td>{$row['status']}</td>
                    <td>{$row['created_at']}</td>
                    <td>{$row['updated_at']}</td>
                  </tr>";
        }

        echo "</tbody></table>";
    } else {
        echo "<p style='color:blue;'>ℹ️ Aucun enregistrement trouvé dans la table <strong>site_creation_requests</strong>.</p>";
    }

} catch (PDOException $e) {
    echo "<h3 style='color:red;'>❌ Erreur : " . htmlspecialchars($e->getMessage()) . "</h3>";
}
?>
