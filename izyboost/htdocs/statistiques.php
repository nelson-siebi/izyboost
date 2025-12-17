<?php
// statistiques.php

session_start();

// Connexion à la base de données
$host = 'sql310.infinityfree.com';
$dbname = 'if0_39106178_izyboost';
$username = 'if0_39106178';
$password = 'RTNrS9RYwvPu';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Récupérer les statistiques
$stats = [];

// Visites totales aujourd'hui
$stmt = $pdo->prepare("SELECT SUM(vues) as total FROM visites WHERE date_visite = ?");
$stmt->execute([date('Y-m-d')]);
$stats['visites_aujourdhui'] = $stmt->fetchColumn();

// Visites totales ce mois
$stmt = $pdo->prepare("SELECT SUM(vues) as total FROM visites WHERE YEAR(date_visite) = ? AND MONTH(date_visite) = ?");
$stmt->execute([date('Y'), date('m')]);
$stats['visites_mois'] = $stmt->fetchColumn();

// Visites totales
$stats['visites_totales'] = $pdo->query("SELECT SUM(vues) FROM visites")->fetchColumn();

// Pages les plus visitées (7 derniers jours)
$stmt = $pdo->prepare("SELECT page, SUM(vues) as total FROM visites 
                      WHERE date_visite >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                      GROUP BY page ORDER BY total DESC LIMIT 5");
$stmt->execute();
$stats['top_pages'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Utilisateurs actifs (7 derniers jours)
$stmt = $pdo->prepare("SELECT COUNT(DISTINCT utilisateur_id) as total FROM visites_utilisateurs 
                      WHERE date_visite >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
$stmt->execute();
$stats['utilisateurs_actifs'] = $stmt->fetchColumn();

// Données pour les graphiques (30 derniers jours)
$stmt = $pdo->prepare("SELECT date_visite, SUM(vues) as total FROM visites 
                      WHERE date_visite >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                      GROUP BY date_visite ORDER BY date_visite");
$stmt->execute();
$visites_par_jour = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Préparer les données pour Chart.js
$labels = [];
$data = [];
foreach ($visites_par_jour as $row) {
    $labels[] = $row['date_visite'];
    $data[] = $row['total'];
}

// Fonction pour générer une couleur aléatoire futuriste
function randomFuturistColor() {
    $colors = [
        '#00f2fe', '#4facfe', '#00f2fe', '#4facfe', 
        '#08aeea', '#2af598', '#08aeea', '#2af598',
        '#b721ff', '#21d4fd', '#b721ff', '#21d4fd',
        '#ff758c', '#ff7eb3', '#ff758c', '#ff7eb3'
    ];
    return $colors[array_rand($colors)];
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tableau de bord statistique - Futuriste</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <style>
        :root {
            --primary: #00f2fe;
            --secondary: #4facfe;
            --dark: #0f172a;
            --darker: #020617;
            --light: #e2e8f0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: var(--darker);
            color: var(--light);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            position: relative;
        }
        
        header h1 {
            font-size: 3rem;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        header::after {
            content: '';
            display: block;
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            margin: 15px auto;
        }
        
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        
        .card {
            background: rgba(15, 23, 42, 0.7);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s, box-shadow 0.3s;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(74, 222, 128, 0.1);
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 242, 254, 0.2);
        }
        
        .card h2 {
            color: var(--primary);
            margin-top: 0;
            font-size: 1.5rem;
            border-bottom: 1px solid rgba(74, 222, 128, 0.3);
            padding-bottom: 10px;
        }
        
        .stat {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin: 15px 0;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        
        .glow {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            box-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .card:hover .glow {
            opacity: 1;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(74, 222, 128, 0.1);
        }
        
        th {
            color: var(--primary);
        }
        
        tr:hover {
            background: rgba(74, 222, 128, 0.05);
        }
        
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.4);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(0, 242, 254, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(0, 242, 254, 0);
            }
        }
        
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: var(--dark);
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Tableau de bord analytique</h1>
            <p>Statistiques des visites en temps réel</p><p><a href="admin/admin.php">administrateur</p></a>
        </header>
        
        <div class="dashboard">
            <!-- Carte 1: Visites aujourd'hui -->
            <div class="card pulse">
                <div class="glow"></div>
                <h2>Visites aujourd'hui</h2>
                <div class="stat"><?php echo number_format($stats['visites_aujourdhui']); ?></div>
                <p>Nombre total de visites aujourd'hui</p>
            </div>
            
            <!-- Carte 2: Visites ce mois -->
            <div class="card">
                <div class="glow"></div>
                <h2>Visites ce mois</h2>
                <div class="stat"><?php echo number_format($stats['visites_mois']); ?></div>
                <p>Nombre total de visites ce mois</p>
            </div>
            
            <!-- Carte 3: Visites totales -->
            <div class="card">
                <div class="glow"></div>
                <h2>Visites totales</h2>
                <div class="stat"><?php echo number_format($stats['visites_totales']); ?></div>
                <p>Depuis le début du suivi</p>
            </div>
            
            <!-- Carte 4: Utilisateurs actifs -->
            <div class="card">
                <div class="glow"></div>
                <h2>Utilisateurs actifs</h2>
                <div class="stat"><?php echo number_format($stats['utilisateurs_actifs']); ?></div>
                <p>Utilisateurs connectés (7 derniers jours)</p>
            </div>
            
            <!-- Carte 5: Graphique des visites -->
            <div class="card" style="grid-column: span 2;">
                <div class="glow"></div>
                <h2>Visites des 30 derniers jours</h2>
                <div class="chart-container">
                    <canvas id="visitsChart"></canvas>
                </div>
            </div>
            
            <!-- Carte 6: Pages populaires -->
            <div class="card" style="grid-column: span 2;">
                <div class="glow"></div>
                <h2>Pages les plus visitées (7 jours)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Page</th>
                            <th>Visites</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($stats['top_pages'] as $page): ?>
                        <tr>
                            <td><?php echo htmlspecialchars($page['page']); ?></td>
                            <td><span class="badge"><?php echo number_format($page['total']); ?></span></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <script>
        // Graphique des visites
        const ctx = document.getElementById('visitsChart').getContext('2d');
        const visitsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: <?php echo json_encode($labels); ?>,
                datasets: [{
                    label: 'Visites par jour',
                    data: <?php echo json_encode($data); ?>,
                    backgroundColor: 'rgba(0, 242, 254, 0.1)',
                    borderColor: '#00f2fe',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: '#4facfe',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#00f2fe',
                        bodyColor: '#e2e8f0',
                        borderColor: '#4facfe',
                        borderWidth: 1,
                        padding: 15
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(74, 222, 128, 0.1)'
                        },
                        ticks: {
                            color: '#e2e8f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#e2e8f0'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        // Animation au chargement
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        });
    </script>
</body>
</html>