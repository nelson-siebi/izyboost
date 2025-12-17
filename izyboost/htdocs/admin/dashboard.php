<?php
session_start();

// Vérification de la session admin
if(!isset($_SESSION['admin_logged_in'])) {
    header("Location: admin.php");
    exit;
}

// Vérification d'inactivité (30 minutes)
if(isset($_SESSION['admin_last_activity']) && (time() - $_SESSION['admin_last_activity'] > 1800)) {
    session_unset();
    session_destroy();
    header("Location: admin.php");
    exit;
}
$_SESSION['admin_last_activity'] = time();

// Connexion à la base de données
$db = new mysqli('sql310.infinityfree.com', 'if0_39106178', 'RTNrS9RYwvPu', 'if0_39106178_izyboost');
if($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

// Récupération des données
$commandes = $db->query("SELECT * FROM commande ORDER BY date_commande DESC");
$users = $db->query("SELECT * FROM users ORDER BY date DESC");
$vraies_commandes = $db->query("SELECT * FROM commandes ORDER BY date DESC");
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Admin | Interface Futuriste</title>
    <link rel="stylesheet" href="admin.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body class="admin-dashboard">
    <div class="admin-container">
        <!-- Sidebar Futuriste -->
        <div class="sidebar">
            <div class="logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#00f0ff" stroke-width="3"/>
                    <circle cx="50" cy="50" r="20" fill="none" stroke="#00f0ff" stroke-width="3"/>
                </svg>
                <h2>ADMIN PANEL</h2>
            </div>
            
            <nav class="menu">
                <ul>
                 <li class="active" data-tab="commandes-tab"><i class="fas fa-shopping-cart"></i><a href="attente.php"> en attentes</a></li>
                    <li class="active" data-tab="commandes-tab"><i class="fas fa-shopping-cart"></i> Commandes</li>
                    <li data-tab="users-tab"><i class="fas fa-users"></i> Utilisateurs</li>
                    <li data-tab="vraies-commandes-tab"><i class="fas fa-list-check"></i> Vraies Commandes</li>
                    <li><a href="../statistiques.php"><i class="fas fa-sign-out-alt"></i> statistiques</a></li>
                    <li><a href="canva.php"><i class="fas fa-sign-out-alt"></i> canva</a></li>
                    <li><a href="../deconnexion.php"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
                </ul>
            </nav>
            
            <div class="status">
                <div class="status-item">
                    <div class="value"><?php echo $commandes->num_rows; ?></div>
                    <div class="label">Commandes</div>
                </div>
                <div class="status-item">
                    <div class="value"><?php echo $users->num_rows; ?></div>
                    <div class="label">Utilisateurs</div>
                </div>
            </div>
        </div>
        
        <!-- Contenu Principal -->
        <div class="main-content">
            <header class="admin-header">
                <h1>Tableau de Bord Admin</h1>
                <div class="admin-info">
                    <span>Connecté en tant qu'<strong>Administrateur</strong></span>
                    <div class="last-activity">Dernière activité: <span id="activity-timer">0:00</span></div>
                </div>
            </header>
            
            <div class="content-tabs">
                <!-- Onglet Commandes -->
                <div class="tab-content active" id="commandes-tab">
                    <h2><i class="fas fa-shopping-cart"></i> Liste des Commandes</h2>
                    <div class="search-filter">
                        <input type="text" id="search-commandes" placeholder="Rechercher une commande..." class="neon-input">
                        <select id="filter-status">
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="completed">Complété</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>
                    
                    <div class="table-container">
                        <table class="neon-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Montant</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while($row = $commandes->fetch_assoc()): ?>
                                <tr data-status="<?php echo htmlspecialchars($row['statut']); ?>">
                                    <td><?php echo htmlspecialchars($row['id']); ?></td>
                                    <td><?php echo htmlspecialchars($row['nom']); ?></td>
                                    <td><?php echo htmlspecialchars($row['email']); ?></td>
                                    <td><?php echo htmlspecialchars($row['phone']); ?></td>
                                    <td><?php echo htmlspecialchars($row['montant']); ?>  FCFA</td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($row['date_commande'])); ?></td>
                                    <td>
                                        <span class="status-badge <?php echo htmlspecialchars($row['statut']); ?>">
                                            <?php echo htmlspecialchars($row['statut']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="action-btn view-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="action-btn edit-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Onglet Utilisateurs -->
                <div class="tab-content" id="users-tab">
                    <h2><i class="fas fa-users"></i> Liste des Utilisateurs</h2>
                    <div class="search-filter">
                        <input type="text" id="search-users" placeholder="Rechercher un utilisateur..." class="neon-input">
                    </div>
                    
                    <div class="table-container">
                        <table class="neon-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Solde</th>
                                    <th>Date Inscription</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while($row = $users->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($row['id']); ?></td>
                                    <td><?php echo htmlspecialchars($row['nom']); ?></td>
                                    <td><?php echo htmlspecialchars($row['email']); ?></td>
                                    <td><?php echo htmlspecialchars($row['numero']); ?></td>
                                    <td><?php echo htmlspecialchars($row['solde']); ?> FCFA</td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($row['date'])); ?></td>
                                    <td>
                                        <button class="action-btn view-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="action-btn edit-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Onglet Vraies Commandes -->
                <div class="tab-content" id="vraies-commandes-tab">
                    <h2><i class="fas fa-list-check"></i> Vraies Commandes</h2>
                    <div class="search-filter">
                        <input type="text" id="search-vraies-commandes" placeholder="Rechercher une commande..." class="neon-input">
                        <select id="filter-vraies-status">
                            <option value="all">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="completed">Complété</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>
                    
                    <div class="table-container">
                        <table class="neon-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>User ID</th>
                                    <th>Service</th>
                                    <th>Lien</th>
                                    <th>Quantité</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php while($row = $vraies_commandes->fetch_assoc()): ?>
                                <tr data-status="<?php echo htmlspecialchars($row['statut']); ?>">
                                    <td><?php echo htmlspecialchars($row['id']); ?></td>
                                    <td><?php echo htmlspecialchars($row['user_id']); ?></td>
                                    <td><?php echo htmlspecialchars($row['service']); ?></td>
                                    <td class="truncate"><?php echo htmlspecialchars($row['lien']); ?></td>
                                    <td><?php echo htmlspecialchars($row['quantite']); ?></td>
                                    <td><?php echo htmlspecialchars($row['total']); ?>  FCFA</td>
                                    <td><?php echo date('d/m/Y H:i', strtotime($row['date'])); ?></td>
                                    <td>
                                        <span class="status-badge <?php echo htmlspecialchars($row['statut']); ?>">
                                            <?php echo htmlspecialchars($row['statut']); ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="action-btn view-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="action-btn edit-btn" data-id="<?php echo $row['id']; ?>">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </td>
                                </tr>
                                <?php endwhile; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Modals -->
    <div class="modal" id="view-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 class="modal-title">Détails</h2>
            <div class="modal-body" id="modal-body-content">
                <!-- Contenu chargé dynamiquement -->
            </div>
        </div>
    </div>
    
    <div class="modal" id="edit-modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2 class="modal-title">Modifier</h2>
            <div class="modal-body">
                <form id="edit-form">
                    <input type="hidden" id="edit-id">
                    <input type="hidden" id="edit-table">
                    <div class="form-group">
                        <label for="edit-statut">Statut</label>
                        <select id="edit-statut" class="neon-input">
                            <option value="pending">En attente</option>
                            <option value="completed">Complété</option>
                            <option value="cancelled">Annulé</option>
                        </select>
                    </div>
                    <button type="submit" class="neon-button">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Enregistrer
                    </button>
                </form>
            </div>
        </div>
    </div>
    
    <script src="assets/js/script.js"></script>
</body>
</html>
<?php $db->close(); ?>