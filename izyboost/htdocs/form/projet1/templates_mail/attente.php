
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle Commande en Attente - IZYBOOST</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .notification-card {
            animation: fadeIn 0.6s ease-out;
        }
        .highlight {
            color: #4F46E5;
            font-weight: 600;
        }
        .btn-admin {
            transition: all 0.3s ease;
        }
        .btn-admin:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
        }
        .pulse-animation {
            animation: pulse 2s infinite;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="notification-card bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-2xl">
        <!-- En-tête -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-bold flex items-center">
                        <span class="pulse-animation mr-3">
                            <i class="fas fa-bell"></i>
                        </span>
                        Nouvelle Commande en Attente
                    </h1>
                    <p class="opacity-90 mt-1">ID Commande: #237</p>
                </div>
                <span class="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                    À valider
                </span>
            </div>
        </div>
        
        <!-- Corps de la notification -->
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Colonne gauche - Détails -->
                <div>
                    <div class="space-y-4">
                        <div>
                            <p class="text-gray-500">Service:</p>
                            <p class="text-lg font-semibold highlight"><?php echo $service; ?></p>
                        </div>
                        
                        <div>
                            <p class="text-gray-500">Montant total:</p>
                            <p class="text-xl font-bold highlight"><?php echo number_format($amount, 0, ',', ' '); ?> XAF</p>
                        </div>
                    </div>
                </div>
                
                <!-- Colonne droite - Autres infos -->
                <div>
                    <div class="space-y-4">
                        <div>
                            <p class="text-gray-500">Quantité demandée:</p>
                            <p class="text-lg highlight"><?php echo number_format($quantite, 0, ',', ' '); ?></p>
                        </div>
                        
                        <div>
                            <p class="text-gray-500">Lien de la commande:</p>
                            <a href="<?php echo $lien; ?>" target="_blank" class="text-indigo-600 hover:underline break-all">
                                <i class="fas fa-external-link-alt mr-1"></i>
                                <?php echo $lien; ?>
                            </a>
                        </div>
                        <div><a href="https://izyboost.wuaze.com/admin/dashboard.php">valider la commande</a>
                    </div>
                </div>
            </div>
            
            <!-- Timeline -->
            <div class="mt-8 border-t pt-6">
                <h3 class="text-lg font-semibold mb-4">Historique de la commande</h3>
                <div class="space-y-4">
                    <div class="flex items-start">
                        <div class="bg-indigo-100 p-2 rounded-full mr-4">
                            <i class="fas fa-plus text-indigo-600"></i>
                        </div>
                        <div>
                            <p class="font-medium">Commande créée</p>
                            <p class="text-sm text-gray-500"><?php echo date('d/m/Y H:i'); ?></p>
                        </div>
                    </div>
                    <div class="flex items-start">
                        <div class="bg-yellow-100 p-2 rounded-full mr-4">
                            <i class="fas fa-clock text-yellow-600"></i>
                        </div>
                        <div>
                            <p class="font-medium">En attente de validation</p>
                            <p class="text-sm text-gray-500">En cours...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Pied de page -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <a href="#" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-envelope mr-2"></i> Recevoir par email
            </a>
            <a href="https://izyboost.wuaze.com/admin/dashboard.php" class="btn-admin bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center">
                <i class="fas fa-cog mr-2"></i> Accéder à l'administration
            </a>
        </div>
    </div>

    <script>
        // Animation au chargement
        document.addEventListener('DOMContentLoaded', () => {
            const notificationSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
            notificationSound.play().catch(e => console.log("Le son ne peut pas être joué automatiquement"));
            
            // Clignotement du titre pour attirer l'attention
            const title = document.querySelector('h1');
            let blinkCount = 0;
            const blinkInterval = setInterval(() => {
                title.style.opacity = title.style.opacity === '0.5' ? '1' : '0.5';
                blinkCount++;
                if (blinkCount >= 6) {
                    clearInterval(blinkInterval);
                    title.style.opacity = '1';
                }
            }, 500);
        });
    </script>
</body>
</html>
