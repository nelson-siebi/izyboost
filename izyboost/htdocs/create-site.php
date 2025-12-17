<?php
session_start();
header('Content-Type: application/json');


define('DB_HOST', 'sql310.infinityfree.com');
define('DB_USER', 'if0_39106178');
define('DB_NAME','if0_39106178_izyboost')
define('DB_PASS', 'RTNrS9RYwvPu');


// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Vous devez être connecté pour créer un site']);
    exit;
}

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

try {
    // Connexion à la base de données
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8", DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Récupération des données du formulaire
    $userId = $_SESSION['user_id'];
    $siteName = filter_input(INPUT_POST, 'siteName', FILTER_SANITIZE_STRING);
    $siteDescription = filter_input(INPUT_POST, 'siteDescription', FILTER_SANITIZE_STRING);
    $siteColor = filter_input(INPUT_POST, 'siteColor', FILTER_SANITIZE_STRING) ?: '#3498db';
    $domainType = filter_input(INPUT_POST, 'domainType', FILTER_SANITIZE_STRING) ?: 'izyboost';
    $adminName = filter_input(INPUT_POST, 'adminName', FILTER_SANITIZE_STRING);
    $adminEmail = filter_input(INPUT_POST, 'adminEmail', FILTER_SANITIZE_EMAIL);
    $adminPhone = filter_input(INPUT_POST, 'adminPhone', FILTER_SANITIZE_STRING);
    $adminCountry = filter_input(INPUT_POST, 'adminCountry', FILTER_SANITIZE_STRING);
    $paymentMethod = filter_input(INPUT_POST, 'paymentMethod', FILTER_SANITIZE_STRING) ?: 'orange';
    $totalPrice = filter_input(INPUT_POST, 'totalPrice', FILTER_VALIDATE_FLOAT);
    $monthlyPrice = filter_input(INPUT_POST, 'monthlyPrice', FILTER_VALIDATE_FLOAT) ?: 5000;

    // Validation des données obligatoires
    $errors = [];
    if (empty($siteName)) $errors[] = 'Le nom du site est obligatoire';
    if (empty($adminName)) $errors[] = 'Le nom administrateur est obligatoire';
    if (empty($adminEmail) || !filter_var($adminEmail, FILTER_VALIDATE_EMAIL)) $errors[] = 'L\'email administrateur est invalide';
    if ($totalPrice === false || $totalPrice < 10000) $errors[] = 'Le prix total est invalide';

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Données invalides', 'errors' => $errors]);
        exit;
    }

    // Traitement du logo
    $logoFilename = null;
    if (isset($_FILES['siteLogo']) && $_FILES['siteLogo']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 2 * 1024 * 1024; // 2MB
        
        $fileType = $_FILES['siteLogo']['type'];
        $fileSize = $_FILES['siteLogo']['size'];
        
        if (in_array($fileType, $allowedTypes) && $fileSize <= $maxSize) {
            $fileExtension = pathinfo($_FILES['siteLogo']['name'], PATHINFO_EXTENSION);
            $logoFilename = uniqid('site_logo_') . '.' . $fileExtension;
            $uploadPath = '../uploads/site_logos/' . $logoFilename;
            
            // Créer le dossier s'il n'existe pas
            if (!is_dir('../uploads/site_logos')) {
                mkdir('../uploads/site_logos', 0755, true);
            }
            
            if (!move_uploaded_file($_FILES['siteLogo']['tmp_name'], $uploadPath)) {
                error_log("Erreur lors de l'upload du logo");
            }
        }
    }

    // Traitement des fonctionnalités
    $features = [];
    $featuresJson = filter_input(INPUT_POST, 'features');
    if ($featuresJson) {
        $features = json_decode($featuresJson, true);
        if (!is_array($features)) {
            $features = [];
        }
    }

    // Préparation de la requête d'insertion
    $sql = "INSERT INTO site_creation_requests (
        user_id, site_name, site_description, site_color, domain_type, 
        logo_filename, features, admin_name, admin_email, admin_phone, 
        admin_country, payment_method, total_price, monthly_price, status
    ) VALUES (
        :user_id, :site_name, :site_description, :site_color, :domain_type,
        :logo_filename, :features, :admin_name, :admin_email, :admin_phone,
        :admin_country, :payment_method, :total_price, :monthly_price, 'pending'
    )";

    $stmt = $pdo->prepare($sql);
    
    // Exécution de la requête
    $stmt->execute([
        ':user_id' => $userId,
        ':site_name' => $siteName,
        ':site_description' => $siteDescription,
        ':site_color' => $siteColor,
        ':domain_type' => $domainType,
        ':logo_filename' => $logoFilename,
        ':features' => json_encode($features, JSON_UNESCAPED_UNICODE),
        ':admin_name' => $adminName,
        ':admin_email' => $adminEmail,
        ':admin_phone' => $adminPhone,
        ':admin_country' => $adminCountry,
        ':payment_method' => $paymentMethod,
        ':total_price' => $totalPrice,
        ':monthly_price' => $monthlyPrice
    ]);

    $requestId = $pdo->lastInsertId();

    // Envoyer un email de confirmation (optionnel)
    sendConfirmationEmail($adminEmail, $adminName, $siteName, $requestId);

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Votre demande de création de site a été enregistrée avec succès',
        'request_id' => $requestId
    ]);

} catch (PDOException $e) {
    error_log("Erreur base de données: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur lors de l\'enregistrement']);
} catch (Exception $e) {
    error_log("Erreur générale: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Une erreur est survenue']);
}

/**
 * Envoie un email de confirmation
 */
function sendConfirmationEmail($email, $name, $siteName, $requestId) {
    $subject = "Confirmation de votre demande de création de site - IzyBoost";
    
    $message = "
    <html>
    <head>
        <title>Confirmation de création de site</title>
        <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3498db; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>IzyBoost - Création de Site</h1>
            </div>
            <div class='content'>
                <h2>Bonjour $name,</h2>
                <p>Nous avons bien reçu votre demande de création du site <strong>$siteName</strong>.</p>
                <p>Votre numéro de demande est: <strong>#$requestId</strong></p>
                <p>Notre équipe va maintenant traiter votre demande et vous contactera dans les plus brefs délais.</p>
                <p><strong>Statut:</strong> En attente de traitement</p>
                <p>Vous recevrez un email dès que votre site sera prêt à être utilisé.</p>
            </div>
            <div class='footer'>
                <p>Merci de votre confiance,<br>L'équipe IzyBoost</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: no-reply@izyboost.com" . "\r\n";
    
    @mail($email, $subject, $message, $headers);
}
?>