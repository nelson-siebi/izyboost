<?php
session_start();
header('Content-Type: application/json');

// Database connection
try {
    $pdo = new PDO("mysql:host=sql310.infinityfree.com;dbname=if0_39106178_izyboost;charset=utf8", "if0_39106178", "RTNrS9RYwvPu");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    die(json_encode(['success' => false, 'message' => 'Erreur de connexion : ' . $e->getMessage()]));
}

// Vérification du token
$token = $_REQUEST['token'] ?? '';
if ($token !== 'your-secure-token') { // À changer en production
    die(json_encode(['success' => false, 'message' => 'Token invalide']));
}

// Handle actions
$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'get_users':
        getUsers();
        break;
    case 'update_user':
        updateUser();
        break;
    case 'send_email':
        sendEmail();
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Action non reconnue']);
        break;
}

function getUsers() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT id, nom, email, numero, solde, date, last_activity FROM users ORDER BY date DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ajout du statut calculé
        foreach ($users as &$user) {
            $user['status'] = calculateStatus($user['last_activity']);
        }
        
        echo json_encode(['success' => true, 'users' => $users]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la récupération des utilisateurs: ' . $e->getMessage()]);
    }
}

function calculateStatus($lastActivity) {
    if (!$lastActivity) return 'offline';
    
    $now = new DateTime();
    $lastActive = new DateTime($lastActivity);
    $interval = $now->diff($lastActive);
    $minutes = ($interval->days * 24 * 60) + ($interval->h * 60) + $interval->i;
    
    if ($minutes < 5) return 'online';
    if ($minutes < 15) return 'away';
    return 'offline';
}

function updateUser() {
    global $pdo;
    
    $id = $_POST['id'] ?? null;
    $email = $_POST['email'] ?? null;
    $solde = $_POST['solde'] ?? null;
    
    if (!$id || !$email || $solde === null) {
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE users SET email = :email, solde = :solde WHERE id = :id");
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':solde', $solde);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        echo json_encode(['success' => true, 'message' => 'Utilisateur mis à jour avec succès']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()]);
    }
}

function sendEmail() {
    $userId = $_POST['user_id'] ?? null;
    $subject = $_POST['subject'] ?? 'Notification de izyboost';
    $message = $_POST['message'] ?? '';
    
    if (!$userId || !$message) {
        echo json_encode(['success' => false, 'message' => 'Données manquantes']);
        return;
    }
    
    global $pdo;
    try {
        // Récupérer les infos utilisateur
        $stmt = $pdo->prepare("SELECT nom, email FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Utilisateur non trouvé']);
            return;
        }
        
        // Préparer les données pour l'API mail
        $mailData = [
            'nom' => $user['nom'],
            'email' => $user['email'],
            'Subject' => $subject,
            'message' => $message,
            'AltBody' => strip_tags($message),
            'type' => 'message'
        ];
        
        // Envoi via l'API mail
        $response = sendMailApi($mailData);
        
        if ($response['success']) {
            echo json_encode(['success' => true, 'message' => 'Email envoyé avec succès']);
        } else {
            echo json_encode(['success' => false, 'message' => "Échec de l'envoi: " . $response['message']]);
        }
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur: ' . $e->getMessage()]);
    }
}

function sendMailApi($data) {
    $apiUrl = "https://izyboost.wuaze.com/form/projet1/send_mail_api.php";
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $response = curl_exec($ch);
    
    if ($response === false) {
        return [
            'success' => false,
            'message' => curl_error($ch)
        ];
    }
    
    curl_close($ch);
    
    $responseData = json_decode($response, true);
    return $responseData ?: [
        'success' => false,
        'message' => 'Réponse API invalide'
    ];
}
?>