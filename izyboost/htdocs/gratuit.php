<?php
$host= 'sql310.infinityfree.com';
$dbname = 'if0_39106178_izyboost';
$username = 'if0_39106178';
$password = 'RTNrS9RYwvPu';
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}



$stmt = $conn->prepare("SELECT lien1, lien2,lien3 FROM canva WHERE id = 1");
$stmt->execute();

$result = $stmt->fetch(PDO::FETCH_ASSOC);


if ($result) {
    $lien1 = $result['lien1'];
    $lien2 = $result['lien2'];
    $lien3 = $result['lien3'];
    $lien4 = $result['lien4'];
} else {
    $lien = "Lien non trouvé";
}
?>



<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IzyBoost - Accès Canva Pro Gratuit</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, #6e48aa, #9d50bb);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #6e48aa, #9d50bb);
        }
        
        .hover-lift:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-800">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                    <img src="a.jpg" alt="IzyBoost Logo" class="h-10 w-10 rounded-full">
                    <h1 class="text-2xl font-bold gradient-text">IzyBoost</h1>
                </div>
                
                <nav class="hidden md:flex space-x-8">
                    <a href="accueil.php" class="font-medium hover:text-purple-600 transition-colors">Accueil</a>
                    <a href="#" class="font-medium text-purple-600">Canva Pro</a>
                    <a href="index.php#services" class="font-medium hover:text-purple-600 transition-colors">Services</a>
                    <a href="politique.html" class="font-medium hover:text-purple-600 transition-colors">Contact</a>
                </nav>
                
                <button class="md:hidden text-gray-600">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row items-center">
                <div class="md:w-1/2 mb-10 md:mb-0">
                    <h1 class="text-4xl md:text-5xl font-bold mb-6 gradient-text">Accédez à Canva Pro <span class="block">Gratuitement</span></h1>
                    <p class="text-lg text-gray-600 mb-8">Rejoignez l'une de nos équipes Canva Pro et bénéficiez de toutes les fonctionnalités premium sans payer un centime. Designez comme un professionnel dès aujourd'hui !</p>
                    <a href="#options" class="inline-block gradient-bg text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all">Voir les options</a>
                </div>
                <div class="md:w-1/2 flex justify-center">
                    <div class="relative">
                        <div class="bg-white p-6 rounded-2xl shadow-xl max-w-md">
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold mr-3">C</div>
                                <div>
                                    <h3 class="font-bold">Canva Pro</h3>
                                    <p class="text-sm text-gray-500">Équipe Premium</p>
                                </div>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg mb-4">
                                <p class="text-sm text-purple-700">✓ Accès à tous les modèles premium</p>
                                <p class="text-sm text-purple-700">✓ Outils de design avancés</p>
                                <p class="text-sm text-purple-700">✓ 100+ millions de ressources</p>
                            </div>
                            <button class="w-full gradient-bg text-white py-2 rounded-lg font-medium">Rejoindre gratuitement</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-4 gradient-text">Pourquoi Canva Pro ?</h2>
            <p class="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Découvrez les avantages exclusifs de Canva Pro pour booster votre créativité</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-gray-50 p-6 rounded-xl text-center hover-lift">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-palette text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Design illimité</h3>
                    <p class="text-gray-600">Accédez à tous les outils de design premium et créez sans limites</p>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-xl text-center hover-lift">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-images text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Ressources premium</h3>
                    <p class="text-gray-600">Plus de 100 millions de photos, illustrations et éléments graphiques</p>
                </div>
                
                <div class="bg-gray-50 p-6 rounded-xl text-center hover-lift">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-magic text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Fonctionnalités avancées</h3>
                    <p class="text-gray-600">Suppression d'arrière-plan, animations, planificateur de contenu et plus</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Options Section -->
    <section id="options" class="py-16 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-4 gradient-text">Options Canva Pro</h2>
            <p class="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Choisissez l'option qui correspond le mieux à vos besoins</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Option 1 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover-lift">
                    <div class="gradient-bg text-white p-4">
                        <h3 class="text-xl font-bold">Option Basique</h3>
                        <div class="text-2xl font-bold mt-2">Gratuit</div>
                    </div>
                    <div class="p-6">
                        <ul class="space-y-3 mb-6">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Accès complet à Canva Pro</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>100+ millions de ressources</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Outils de design premium</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Support communautaire</span>
                            </li>
                        </ul>
                        <a href="<?php echo htmlspecialchars($lien1); ?>" class="block w-full gradient-bg text-white text-center font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">Rejoindre (Lien 1)</a>
                    </div>
                </div>
                
                <!-- Option 2 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover-lift">
                    <div class="gradient-bg text-white p-4">
                        <h3 class="text-xl font-bold">Option Standard</h3>
                        <div class="text-2xl font-bold mt-2">Gratuit</div>
                    </div>
                    <div class="p-6">
                        <ul class="space-y-3 mb-6">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Tout dans Basique</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Accès prioritaire</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Équipe plus stable</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Mises à jour régulières</span>
                            </li>
                        </ul>
                        <a href="<?php echo htmlspecialchars($lien2); ?>" class="block w-full gradient-bg text-white text-center font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">Rejoindre (Lien 2)</a>
                    </div>
                </div>
                
                <!-- Option 3 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover-lift">
                    <div class="gradient-bg text-white p-4">
                        <h3 class="text-xl font-bold">Option Premium</h3>
                        <div class="text-2xl font-bold mt-2">Gratuit</div>
                    </div>
                    <div class="p-6">
                        <ul class="space-y-3 mb-6">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Tout dans Standard</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Équipe vérifiée</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Support prioritaire</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Accès aux bêta-tests</span>
                            </li>
                        </ul>
                        <a href="<?php echo htmlspecialchars($lien3); ?>" class="block w-full gradient-bg text-white text-center font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">Rejoindre (Lien 3)</a>
                    </div>
                </div>
                
                <!-- Option 4 -->
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover-lift">
                    <div class="gradient-bg text-white p-4">
                        <h3 class="text-xl font-bold">Option Entreprise</h3>
                        <div class="text-2xl font-bold mt-2">Gratuit</div>
                    </div>
                    <div class="p-6">
                        <ul class="space-y-3 mb-6">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Tout dans Premium</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Équipe dédiée</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Collaboration en temps réel</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-500 mt-1 mr-2"></i>
                                <span>Gestion des membres</span>
                            </li>
                        </ul>
                        <a href="<?php echo htmlspecialchars($lien1); ?>" class="block w-full gradient-bg text-white text-center font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">Rejoindre (Lien 4)</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-4 gradient-text">Questions Fréquentes</h2>
            <p class="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">Trouvez rapidement des réponses à vos questions</p>
            
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="bg-gray-50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold mb-2">Comment fonctionne l'accès gratuit à Canva Pro ?</h3>
                    <p class="text-gray-600">Nous partageons des comptes Canva Pro d'équipe avec nos membres. Vous rejoignez simplement l'une de nos équipes et bénéficiez de tous les avantages de Canva Pro gratuitement.</p>
                </div>
                
                <div class="bg-gray-50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold mb-2">Est-ce vraiment gratuit ?</h3>
                    <p class="text-gray-600">Oui, absolument ! Nous proposons l'accès à Canva Pro sans aucun frais. Notre objectif est de rendre les outils de design premium accessibles à tous.</p>
                </div>
                
                <div class="bg-gray-50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold mb-2">Combien de temps dure l'accès ?</h3>
                    <p class="text-gray-600">L'accès est permanent tant que vous restez membre de l'équipe. Nous maintenons nos équipes actives et renouvelons les abonnements régulièrement.</p>
                </div>
                
                <div class="bg-gray-50 rounded-xl p-6">
                    <h3 class="text-xl font-semibold mb-2">Y a-t-il des limitations ?</h3>
                    <p class="text-gray-600">Vous bénéficiez de toutes les fonctionnalités de Canva Pro sans limitations. La seule différence est que vous partagez l'espace de l'équipe avec d'autres membres.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 gradient-bg text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-6">Prêt à booster votre créativité ?</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto">Rejoignez l'une de nos équipes Canva Pro dès maintenant et commencez à créer des designs professionnels gratuitement</p>
            <a href="#options" class="inline-block bg-white text-purple-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-colors">Choisir une option</a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center space-x-2 mb-4">
                        <img src="a.jpg" alt="IzyBoost Logo" class="h-8 w-8 rounded-full">
                        <h3 class="text-xl font-bold">IzyBoost</h3>
                    </div>
                    <p class="text-gray-400 mb-4">La solution ultime pour accéder à Canva Pro gratuitement.</p>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-facebook-f"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-instagram"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fab fa-discord"></i>
                        </a>
                    </div>
                </div>
                
                <div>
                    <h4 class="text-lg font-semibold mb-4">Liens rapides</h4>
                    <ul class="space-y-2">
                        <li><a href="accueil.php" class="text-gray-400 hover:text-white transition-colors">Accueil</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Canva Pro</a></li>
                        <li><a href="index.php#services" class="text-gray-400 hover:text-white transition-colors">Services</a></li>
                        <li><a href="politique.html" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-lg font-semibold mb-4">Ressources</h4>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Tutoriels Canva</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Modèles gratuits</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                        <li><a href="nexius.php" class="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="text-lg font-semibold mb-4">Légal</h4>
                    <ul class="space-y-2">
                        <li><a href="politique.html" class="text-gray-400 hover:text-white transition-colors">Conditions d'utilisation</a></li>
                        <li><a href="politique.html" class="text-gray-400 hover:text-white transition-colors">Politique de confidentialité</a></li>
                        <li><a href="nexius.php" class="text-gray-400 hover:text-white transition-colors">Mentions légales</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2025 IzyBoost. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                
                document.querySelector(this.getAttribute('href')).scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    </script>
</body>
</html>