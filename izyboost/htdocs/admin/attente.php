<?php
session_start();

// Sécurité d'accès
define('ADMIN_PASSWORD', 'nexky237'); // Mot de passe admin

// Vérification de l'authentification
if (!isset($_SESSION['admin_logged']) || $_SESSION['admin_logged'] !== true) {
    if (isset($_POST['password'])) {
        if ($_POST['password'] === ADMIN_PASSWORD) {
            $_SESSION['admin_logged'] = true;
        } else {
            die("Mot de passe incorrect");
        }
    } else {
        showLoginForm();
        exit;
    }
}

// Connexion à la base de données
$db = new mysqli("sql310.infinityfree.com", "if0_39106178", "RTNrS9RYwvPu", "if0_39106178_izyboost");
if ($db->connect_error) {
    die("Erreur de connexion: " . $db->connect_error);
}

// Traitement des actions
if (isset($_GET['action'])) {
    switch ($_GET['action']) {
        case 'validate':
            validateOrder($db, $_GET['id']);
            break;
        case 'delete':
            deleteOrder($db, $_GET['id']);
            break;
        case 'logout':
            session_destroy();
            header("Location: admin.php");
            exit;
    }
}

// Fonctions principales
function validateOrder($db, $id) {
    $stmt = $db->prepare("UPDATE attente SET validate = 1 WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    header("Location: attente.php");
    exit;
}

function deleteOrder($db, $id) {
    $stmt = $db->prepare("DELETE FROM attente WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    header("Location: attente.php");
    exit;
}

function showLoginForm() {
    echo <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .login-form {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="login-form bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Connexion Admin</h1>
        <form method="POST" class="space-y-4">
            <div>
                <label class="block text-gray-700 mb-2">Mot de passe</label>
                <input type="password" name="password" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition transform hover:scale-105">
                Se connecter
            </button>
        </form>
    </div>
</body>
</html>
HTML;
}

// Affichage du tableau de bord admin
function showAdminDashboard($db) {
    // Récupération des commandes
    $pending = $db->query("SELECT * FROM attente WHERE validate = 0 ORDER BY date DESC");
    $validated = $db->query("SELECT * FROM attente WHERE validate = 1 ORDER BY date DESC");

    echo <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Commandes en attente</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        .card {
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn {
            transition: all 0.2s ease;
        }
        .btn:hover {
            transform: scale(1.05);
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .badge {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Tableau de bord Admin</h1>
            <a href="?action=logout" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition btn">
                <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
            </a>
        </div>

        <!-- Commandes en attente -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-8 fade-in">
            <h2 class="text-xl font-semibold mb-4 flex items-center">
                <span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm mr-2 badge">Nouveau</span>
                Commandes en attente de validation
            </h2>
            
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead>
                        <tr class="bg-gray-200 text-gray-700">
                            <th class="py-3 px-4 text-left">ID</th>
                             <th class="py-3 px-4 text-left">user_id</th>
                            <th class="py-3 px-4 text-left">Service</th>
                            <th class="py-3 px-4 text-left">Lien</th>
                            <th class="py-3 px-4 text-left">Quantité</th>
                            <th class="py-3 px-4 text-left">Total</th>
                            <th class="py-3 px-4 text-left">Date</th>
                            <th class="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700">
HTML;

    if ($pending->num_rows > 0) {
        while ($row = $pending->fetch_assoc()) {
            echo <<<HTML
                        <tr class="border-b border-gray-200 hover:bg-gray-50 card">
                            <td class="py-3 px-4">{$row['id']}</td>
                            <td class="py-3 px-4">{$row['user_id']}</td>
                            <td class="py-3 px-4">{$row['service']}</td>
                            <td class="py-3 px-4">
                                <a href="{$row['lien']}" target="_blank" class="text-blue-500 hover:underline truncate max-w-xs inline-block">
                                    {$row['lien']}
                                </a>
                            </td>
                            <td class="py-3 px-4">{$row['quantite']}</td>
                            <td class="py-3 px-4">{$row['total']} FCFA</td>
                            <td class="py-3 px-4">{$row['date']}</td>
                            <td class="py-3 px-4">
                                <div class="flex space-x-2">
                                    <a href="?action=validate&id={$row['id']}" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition btn" title="Valider">
                                        <i class="fas fa-check"></i>
                                    </a>
                                    <a href="?action=delete&id={$row['id']}" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition btn" title="Supprimer" onclick="return confirm('Êtes-vous sûr ?')">
                                        <i class="fas fa-trash"></i>
                                    </a>
                                </div>
                            </td>
                        </tr>
HTML;
        }
    } else {
        echo '<tr><td colspan="7" class="py-4 text-center text-gray-500">Aucune commande en attente</td></tr>';
    }

    echo <<<HTML
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Commandes validées -->
        <div class="bg-white rounded-lg shadow-md p-6 fade-in">
            <h2 class="text-xl font-semibold mb-4">
                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                Commandes validées
            </h2>
            
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white">
                    <thead>
                        <tr class="bg-gray-200 text-gray-700">
                            <th class="py-3 px-4 text-left">ID</th>
                             <th class="py-3 px-4 text-left">id_user</th>
                            <th class="py-3 px-4 text-left">Service</th>
                            <th class="py-3 px-4 text-left">Lien</th>
                            <th class="py-3 px-4 text-left">Quantité</th>
                            <th class="py-3 px-4 text-left">Total</th>
                            <th class="py-3 px-4 text-left">Date</th>
                           
                            <th class="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="text-gray-700">
HTML;

    if ($validated->num_rows > 0) {
        while ($row = $validated->fetch_assoc()) {
            echo <<<HTML
                        <tr class="border-b border-gray-200 hover:bg-gray-50 card">
                            <td class="py-3 px-4">{$row['id']}</td>
                            <td class="py-3 px-4">{$row['user_id']}</td>

                            <td class="py-3 px-4">{$row['service']}</td>
                            <td class="py-3 px-4">
                                <a href="{$row['lien']}" target="_blank" class="text-blue-500 hover:underline truncate max-w-xs inline-block">
                                    {$row['lien']}
                                </a>
                            </td>
                            <td class="py-3 px-4">{$row['quantite']}</td>
                            <td class="py-3 px-4">{$row['total']} FCFA</td>
                            <td class="py-3 px-4">{$row['date']}</td>
                            <td class="py-3 px-4">
                                <a href="?action=delete&id={$row['id']}" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition btn" title="Supprimer" onclick="return confirm('Êtes-vous sûr ?')">
                                    <i class="fas fa-trash"></i>
                                </a>
                            </td>
                        </tr>
HTML;
        }
    } else {
        echo '<tr><td colspan="7" class="py-4 text-center text-gray-500">Aucune commande validée</td></tr>';
    }

    echo <<<HTML
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Animation pour les boutons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.05)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    </script>
</body>
</html>
HTML;
}

// Afficher le tableau de bord si authentifié
if (isset($_SESSION['admin_logged']) && $_SESSION['admin_logged'] === true) {
    showAdminDashboard($db);
}

$db->close();
?>