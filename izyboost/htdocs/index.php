<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IZYBOOST - Boostage, Comptes & Formations Numériques</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --accent: #f59e0b;
            --light: #f8fafc;
            --dark: #1e293b;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--light);
            color: var(--dark);
            overflow-x: hidden;
            scroll-behavior: smooth;
        }
        
        /* Animation classes */
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .fade-in.appear {
            opacity: 1;
            transform: translateY(0);
        }
        
        .slide-in-left {
            opacity: 0;
            transform: translateX(-50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .slide-in-left.appear {
            opacity: 1;
            transform: translateX(0);
        }
        
        .slide-in-right {
            opacity: 0;
            transform: translateX(50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .slide-in-right.appear {
            opacity: 1;
            transform: translateX(0);
        }
        
        .scale-in {
            opacity: 0;
            transform: scale(0.9);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .scale-in.appear {
            opacity: 1;
            transform: scale(1);
        }
        
        /* Hero carousel */
        .hero-carousel {
            position: relative;
            height: 100vh;
            overflow: hidden;
        }
        
        .carousel-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 1s ease-in-out;
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .carousel-slide.active {
            opacity: 1;
        }
        
        .carousel-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.3));
        }
        
        .carousel-content {
            position: relative;
            z-index: 2;
            text-align: center;
            color: white;
            max-width: 800px;
            padding: 0 20px;
        }
        
        .carousel-indicators {
            position: absolute;
            bottom: 30px;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            gap: 10px;
            z-index: 10;
        }
        
        .carousel-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: rgba(255,255,255,0.5);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .carousel-indicator.active {
            background-color: white;
            transform: scale(1.2);
        }
        
        .carousel-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(255,255,255,0.2);
            color: white;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 10;
        }
        
        .carousel-nav:hover {
            background-color: rgba(255,255,255,0.3);
        }
        
        .carousel-prev {
            left: 20px;
        }
        
        .carousel-next {
            right: 20px;
        }
        
        /* Interactive elements */
        .interactive-card {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .interactive-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .interactive-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(to right, var(--primary), var(--secondary));
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
        }
        
        .interactive-card:hover::before {
            transform: scaleX(1);
        }
        
        .floating-element {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
        
        .pulse-animation {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }
        
        /* Stats counter */
        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: var(--primary);
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--primary-dark);
        }
        
        /* Mobile menu */
        .mobile-menu {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        
        .mobile-menu.open {
            transform: translateX(0);
        }
        
        /* Loading animation */
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--primary);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Interactive tabs */
        .tab-button {
            transition: all 0.3s ease;
        }
        
        .tab-button.active {
            background-color: var(--primary);
            color: white;
        }
        
        /* Parallax effect */
        .parallax {
            background-attachment: fixed;
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
        }
        
        /* Gradient text */
        .gradient-text {
            background: linear-gradient(to right, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        /* 3D card effect */
        .card-3d {
            transform-style: preserve-3d;
            perspective: 1000px;
        }
        
        .card-3d:hover {
            transform: rotateY(10deg) rotateX(5deg);
        }
        
        /* Custom button styles */
        .btn-primary {
            background: linear-gradient(to right, var(--primary), var(--secondary));
            color: white;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
            text-align: center;
            box-shadow: 0 4px 15px 0 rgba(99, 102, 241, 0.3);
        }
        
        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px 0 rgba(99, 102, 241, 0.4);
        }
        
        .btn-outline {
            border: 2px solid var(--primary);
            color: var(--primary);
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s ease;
            display: inline-block;
            text-align: center;
        }
        
        .btn-outline:hover {
            background-color: var(--primary);
            color: white;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <div class="flex items-center">
                <a href="#" class="text-2xl font-bold gradient-text flex items-center">
                    <i class="fas fa-rocket mr-2"></i>
                    IZYBOOST
                </a>
            </div>
            
            <nav class="hidden md:flex space-x-8">
                <a href="#" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Accueil</a>
                <a href="#services" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Services</a>
                <a href="#formations" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Formations</a>
                <a href="#comptes" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Comptes</a>
                <a href="#avis" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Avis</a>
                <a href="#contact" class="text-gray-700 hover:text-indigo-600 font-medium transition duration-300">Contact</a>
            </nav>
            
            <div class="flex items-center space-x-4">
                <a href="https://izyboost.wuaze.com/auth/login.php" class="btn-primary hidden md:block">
                    Connexion
                </a>
                <button class="md:hidden text-gray-700" id="mobile-menu-button">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div class="mobile-menu md:hidden fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 p-6" id="mobile-menu">
            <div class="flex justify-between items-center mb-8">
                <a href="#" class="text-xl font-bold gradient-text">
                    <i class="fas fa-rocket mr-2"></i>
                    IZYBOOST
                </a>
                <button id="close-mobile-menu" class="text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <nav class="space-y-4">
                <a href="#" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Accueil</a>
                <a href="#services" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Services</a>
                <a href="#formations" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Formations</a>
                <a href="#comptes" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Comptes</a>
                <a href="#avis" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Avis</a>
                <a href="#contact" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Contact</a>
                <a href="izyboost.apk" download="izyboost" class="block py-2 text-gray-700 hover:text-indigo-600 font-medium">Télécharger l'app Android</a>
            </nav>
            
            <div class="mt-8">
                <a href="https://izyboost.wuaze.com/auth/login.php" class="btn-primary w-full text-center">
                    Connexion
                </a>
            </div>
        </div>
    </header>

    <!-- Hero Section with Carousel -->
    <section class="hero-carousel">
        <!-- Slide 1 -->
        <div class="carousel-slide active" style="background-image: url('https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')">
            <div class="carousel-overlay"></div>
            <div class="carousel-content fade-in appear">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">Boostez vos réseaux en 1 clic</h1>
                <p class="text-xl md:text-2xl mb-8">Augmentez votre visibilité sur les réseaux sociaux avec nos services professionnels de boost.</p>
                <a href="accueil.php" class="btn-primary pulse-animation text-lg px-8 py-4">
                    Commencer maintenant <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
        
        <!-- Slide 2 -->
        <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">Formations 100% digitales</h1>
                <p class="text-xl md:text-2xl mb-8">Maîtrisez les outils du numérique avec nos formations complètes et accessibles.</p>
                <a href="accueil.php" class="btn-primary text-lg px-8 py-4">
                    Voir les formations <i class="fas fa-graduation-cap ml-2"></i>
                </a>
            </div>
        </div>
        
        <!-- Slide 3 -->
        <div class="carousel-slide" style="background-image: url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
                <h1 class="text-4xl md:text-6xl font-bold mb-6">Comptes premium à votre portée</h1>
                <p class="text-xl md:text-2xl mb-8">Accédez à des comptes premium sur les plateformes les plus populaires à des prix imbattables.</p>
                <a href="accueil.php" class="btn-primary text-lg px-8 py-4">
                    Explorer les comptes <i class="fas fa-crown ml-2"></i>
                </a>
            </div>
        </div>
        
        <!-- Navigation -->
        <button class="carousel-nav carousel-prev">
            <i class="fas fa-chevron-left"></i>
        </button>
        <button class="carousel-nav carousel-next">
            <i class="fas fa-chevron-right"></i>
        </button>
        
        <!-- Indicators -->
        <div class="carousel-indicators">
            <div class="carousel-indicator active" data-slide="0"></div>
            <div class="carousel-indicator" data-slide="1"></div>
            <div class="carousel-indicator" data-slide="2"></div>
        </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div class="fade-in">
                    <div class="stat-number" data-target="2800">0</div>
                    <p class="text-gray-600">Clients satisfaits</p>
                </div>
                <div class="fade-in">
                    <div class="stat-number" data-target="12000">0</div>
                    <p class="text-gray-600">Services réalisés</p>
                </div>
                <div class="fade-in">
                    <div class="stat-number" data-target="98">0</div>
                    <p class="text-gray-600">% de satisfaction</p>
                </div>
                <div class="fade-in">
                    <div class="stat-number" data-target="24">0</div>
                    <p class="text-gray-600">Support 24/7</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Nos Services Populaires</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Découvrez nos services de boostage de réseaux sociaux pour augmenter votre visibilité et votre engagement</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Service 1 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden fade-in">
                    <div class="h-48 bg-indigo-100 flex items-center justify-center relative">
                        <i class="fab fa-instagram text-6xl text-indigo-600 floating-element"></i>
                        <div class="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Populaire
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Boost Instagram</h3>
                        <p class="text-gray-600 mb-4">Augmentez vos abonnés, likes et commentaires de manière organique et sécurisée</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-indigo-600">À partir de 300 XAF</span>
                            <button class="btn-outline btn-service" data-service="Instagram Boost">
                                Voir plus
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Service 2 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden fade-in">
                    <div class="h-48 bg-blue-100 flex items-center justify-center">
                        <i class="fab fa-tiktok text-6xl text-blue-600 floating-element"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Boost TikTok</h3>
                        <p class="text-gray-600 mb-4">Augmentez vos vues, likes et followers sur TikTok pour une visibilité maximale</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-blue-600">À partir de 100 XAF</span>
                            <button class="btn-outline btn-service" data-service="TikTok Boost">
                                Voir plus
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Service 3 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden fade-in">
                    <div class="h-48 bg-green-100 flex items-center justify-center">
                        <i class="fab fa-youtube text-6xl text-green-600 floating-element"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Boost YouTube</h3>
                        <p class="text-gray-600 mb-4">Augmentez vos abonnés, vues et likes pour développer votre chaîne YouTube</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-green-600">À partir de 1000 XAF</span>
                            <button class="btn-outline btn-service" data-service="YouTube Boost">
                                Voir plus
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <a href="accueil.php" class="btn-primary">
                    Voir tous nos services <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Interactive Tabs Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Comment ça marche</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Découvrez notre processus simple en 3 étapes pour booster votre présence en ligne</p>
            </div>
            
            <div class="max-w-4xl mx-auto">
                <div class="flex flex-wrap justify-center mb-8">
                    <button class="tab-button active px-6 py-3 rounded-t-lg font-medium" data-tab="step1">
                        Étape 1: Choisir
                    </button>
                    <button class="tab-button px-6 py-3 rounded-t-lg font-medium" data-tab="step2">
                        Étape 2: Commander
                    </button>
                    <button class="tab-button px-6 py-3 rounded-t-lg font-medium" data-tab="step3">
                        Étape 3: Profiter
                    </button>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-8">
                    <div id="step1" class="tab-content active">
                        <div class="flex flex-col md:flex-row items-center">
                            <div class="md:w-1/2 mb-6 md:mb-0">
                                <h3 class="text-2xl font-bold mb-4">Choisissez votre service</h3>
                                <p class="text-gray-600 mb-4">Parcourez notre catalogue de services et sélectionnez celui qui correspond à vos besoins : boost d'abonnés, de likes, de vues, etc.</p>
                                <ul class="space-y-2">
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Large choix de plateformes</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Différents volumes disponibles</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Prix transparents</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="md:w-1/2 flex justify-center">
                                <div class="w-64 h-64 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-mouse-pointer text-6xl text-indigo-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="step2" class="tab-content hidden">
                        <div class="flex flex-col md:flex-row items-center">
                            <div class="md:w-1/2 mb-6 md:mb-0">
                                <h3 class="text-2xl font-bold mb-4">Passez commande</h3>
                                <p class="text-gray-600 mb-4">Remplissez le formulaire de commande avec les détails de votre compte et effectuez le paiement en toute sécurité.</p>
                                <ul class="space-y-2">
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Processus sécurisé</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Paiement multiple</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Confidentialité garantie</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="md:w-1/2 flex justify-center">
                                <div class="w-64 h-64 bg-blue-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-shopping-cart text-6xl text-blue-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="step3" class="tab-content hidden">
                        <div class="flex flex-col md:flex-row items-center">
                            <div class="md:w-1/2 mb-6 md:mb-0">
                                <h3 class="text-2xl font-bold mb-4">Profitez des résultats</h3>
                                <p class="text-gray-600 mb-4">Votre commande est traitée rapidement et vous commencez à voir les résultats dans les heures qui suivent.</p>
                                <ul class="space-y-2">
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Livraison rapide</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Résultats garantis</span>
                                    </li>
                                    <li class="flex items-center">
                                        <i class="fas fa-check text-green-500 mr-2"></i>
                                        <span>Support 24/7</span>
                                    </li>
                                </ul>
                            </div>
                            <div class="md:w-1/2 flex justify-center">
                                <div class="w-64 h-64 bg-green-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-chart-line text-6xl text-green-600"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Comptes Premium Section -->
    <section id="comptes" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Comptes Premium</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Accédez à des comptes premium sur les plateformes les plus populaires à des prix imbattables</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Compte 1 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden scale-in">
                    <div class="h-40 bg-red-100 flex items-center justify-center">
                        <i class="fab fa-spotify text-5xl text-red-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Spotify Premium</h3>
                        <p class="text-gray-600 mb-4">Compte premium valide 12 mois</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-red-600">300 XAF</span>
                            <button class="btn-outline btn-account" data-account="Spotify Premium">
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Compte 2 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden scale-in">
                    <div class="h-40 bg-yellow-100 flex items-center justify-center">
                        <i class="fab fa-paypal text-5xl text-yellow-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">PayPal Premium</h3>
                        <p class="text-gray-600 mb-4">Compte PREMIUM vérifié</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-yellow-600">5000 XAF</span>
                            <button class="btn-outline btn-account" data-account="PayPal Premium">
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Compte 3 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden scale-in">
                    <div class="h-40 bg-gray-100 flex items-center justify-center">
                        <i class="fab fa-netflix text-5xl text-gray-800"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Netflix Premium</h3>
                        <p class="text-gray-600 mb-4">Compte 4K UHD valide 6 mois</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-gray-800">2000 XAF</span>
                            <button class="btn-outline btn-account" data-account="Netflix Premium">
                                Acheter
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Compte 4 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden scale-in">
                    <div class="h-40 bg-blue-100 flex items-center justify-center">
                        <i class="fab fa-canva text-5xl text-blue-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Canva Pro</h3>
                        <p class="text-gray-600 mb-4">Compte avec abonnements inclus</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-blue-600">GRATUIT</span>
                            <a href="gratuit.php" class="btn-outline">
                                Obtenir
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <a href="accueil.php" class="btn-primary">
                    Voir tous les comptes <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Formations Section -->
    <section id="formations" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Nos Formations</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Maîtrisez les outils du numérique avec nos formations complètes et accessibles</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Formation 1 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden slide-in-left">
                    <div class="h-48 bg-indigo-100 flex items-center justify-center">
                        <i class="fas fa-hashtag text-5xl text-indigo-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Growth Instagram</h3>
                        <p class="text-gray-600 mb-4">Maîtrisez l'algorithme et développez votre audience sur Instagram</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-indigo-600">4000 XAF</span>
                            <button class="btn-outline btn-training" data-training="Growth Instagram">
                                Détails
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Formation 2 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden fade-in">
                    <div class="h-48 bg-blue-100 flex items-center justify-center">
                        <i class="fas fa-video text-5xl text-blue-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Montage Vidéo Pro</h3>
                        <p class="text-gray-600 mb-4">Apprenez à monter des vidéos professionnelles avec les meilleurs outils</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-blue-600">10000 XAF</span>
                            <button class="btn-outline btn-training" data-training="Montage Vidéo Pro">
                                Détails
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Formation 3 -->
                <div class="interactive-card bg-white rounded-xl shadow-md overflow-hidden slide-in-right">
                    <div class="h-48 bg-green-100 flex items-center justify-center">
                        <i class="fas fa-ad text-5xl text-green-600"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Publicité Facebook</h3>
                        <p class="text-gray-600 mb-4">Créez des campagnes publicitaires efficaces sur Facebook et Instagram</p>
                        <div class="flex justify-between items-center">
                            <span class="font-bold text-green-600">5000 XAF</span>
                            <button class="btn-outline btn-training" data-training="Publicité Facebook">
                                Détails
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-12">
                <a href="accueil.php" class="btn-primary">
                    Voir toutes les formations <i class="fas fa-arrow-right ml-2"></i>
                </a>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section id="avis" class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Avis de nos clients</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Découvrez ce que nos clients disent de nos services</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Avis 1 -->
                <div class="bg-white p-6 rounded-xl shadow-md fade-in">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4">
                            RF
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">Roger Faril</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"Le boost Instagram a vraiment fonctionné pour mon compte. J'ai gagné 1000 abonnés en une semaine sans aucun problème. Je recommande !"</p>
                </div>
                
                <!-- Avis 2 -->
                <div class="bg-white p-6 rounded-xl shadow-md fade-in">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                            JR
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">Junior Rfr</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"La formation montage vidéo est complète et bien expliquée. J'ai pu monter mes premières vidéos professionnelles dès la première semaine."</p>
                </div>
                
                <!-- Avis 3 -->
                <div class="bg-white p-6 rounded-xl shadow-md fade-in">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-4">
                            AB
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">Ange Bella</h4>
                            <div class="flex text-yellow-400">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600">"Le compte Netflix premium fonctionne parfaitement depuis 3 mois. Livraison instantanée et prix imbattable. Je reviendrai !"</p>
                </div>
            </div>
            
            <!-- Add Testimonial Form -->
            <div class="max-w-2xl mx-auto mt-16 bg-white p-8 rounded-xl shadow-md scale-in">
                <h3 class="text-xl font-semibold text-gray-800 mb-6">Ajouter votre avis</h3>
                <form id="testimonial-form">
                    <div class="mb-4">
                        <label for="name" class="block text-gray-700 mb-2">Votre nom</label>
                        <input type="text" id="name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="comment" class="block text-gray-700 mb-2">Votre commentaire</label>
                        <textarea id="comment" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
                    </div>
                    <div class="mb-6">
                        <label class="block text-gray-700 mb-2">Note</label>
                        <div class="rating flex space-x-1">
                            <input type="radio" id="star5" name="rating" value="5">
                            <label for="star5" class="text-2xl cursor-pointer"><i class="far fa-star"></i></label>
                            <input type="radio" id="star4" name="rating" value="4">
                            <label for="star4" class="text-2xl cursor-pointer"><i class="far fa-star"></i></label>
                            <input type="radio" id="star3" name="rating" value="3">
                            <label for="star3" class="text-2xl cursor-pointer"><i class="far fa-star"></i></label>
                            <input type="radio" id="star2" name="rating" value="2">
                            <label for="star2" class="text-2xl cursor-pointer"><i class="far fa-star"></i></label>
                            <input type="radio" id="star1" name="rating" value="1">
                            <label for="star1" class="text-2xl cursor-pointer"><i class="far fa-star"></i></label>
                        </div>
                    </div>
                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300">
                        Envoyer mon avis
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Prêt à booster votre présence en ligne ?</h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto">Rejoignez des milliers de clients satisfaits et donnez un coup de pouce à vos réseaux sociaux dès aujourd'hui</p>
            <a href="accueil.php" class="btn-primary bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-4 inline-block">
                Commencer maintenant <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Contactez-nous</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">Une question ? N'hésitez pas à nous contacter, notre équipe est à votre disposition</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <!-- Contact Form -->
                <div class="bg-gray-50 p-8 rounded-xl shadow-md slide-in-left">
                    <form id="contact-form">
                        <div class="mb-6">
                            <label for="contact-name" class="block text-gray-700 mb-2">Votre nom</label>
                            <input type="text" id="contact-name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="mb-6">
                            <label for="contact-email" class="block text-gray-700 mb-2">Votre email</label>
                            <input type="email" id="contact-email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                        </div>
                        <div class="mb-6">
                            <label for="contact-message" class="block text-gray-700 mb-2">Votre message</label>
                            <textarea id="contact-message" rows="5" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
                        </div>
                        <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition duration-300 transform hover:scale-105">
                            Envoyer le message
                        </button>
                    </form>
                </div>
                
                <!-- Contact Info -->
                <div class="bg-gray-50 p-8 rounded-xl shadow-md slide-in-right">
                    <div class="flex items-start mb-8">
                        <div class="bg-indigo-100 p-3 rounded-full mr-4">
                            <i class="fas fa-map-marker-alt text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Adresse</h3>
                            <p class="text-gray-600">ESG, DOUALA, CAMEROUN</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start mb-8">
                        <div class="bg-indigo-100 p-3 rounded-full mr-4">
                            <i class="fas fa-envelope text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Email</h3>
                            <p class="text-gray-600">nelsonsiebi237@gmail.com</p>
                        </div>
                    </div>
                    
                    <div class="flex items-start mb-8">
                        <div class="bg-indigo-100 p-3 rounded-full mr-4">
                            <i class="fas fa-phone-alt text-indigo-600 text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Téléphone</h3>
                            <p class="text-gray-600">+237 676676120</p>
                        </div>
                    </div>
                    
                    <div class="mt-12">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Suivez-nous</h3>
                        <div class="flex space-x-4">
                            <a href="https://www.facebook.com/profile.php?id=61576570928288" class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                                <i class="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                                <i class="fab fa-twitter"></i>
                            </a>
                            <a href="#" class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                                <i class="fab fa-instagram"></i>
                            </a>
                            <a href="#" class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                                <i class="fab fa-linkedin-in"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <!-- Column 1 -->
                <div>
                    <a href="#" class="text-2xl font-bold text-white flex items-center mb-4">
                        <i class="fas fa-rocket mr-2"></i>
                        IZYBOOST
                    </a>
                    <p class="text-gray-400 mb-4">Votre partenaire pour le boostage numérique, les comptes premium et les formations digitales.</p>
                    <p class="text-gray-400">© 2025 IZYBOOST. Tous droits réservés.</p>
                </div>
                
                <!-- Column 2 -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Liens utiles</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Accueil</a></li>
                        <li><a href="#services" class="text-gray-400 hover:text-white transition duration-300">Nos services</a></li>
                        <li><a href="#formations" class="text-gray-400 hover:text-white transition duration-300">Formations</a></li>
                        <li><a href="#avis" class="text-gray-400 hover:text-white transition duration-300">Avis clients</a></li>
                        <li><a href="#contact" class="text-gray-400 hover:text-white transition duration-300">Contact</a></li>
                    </ul>
                </div>
                
                <!-- Column 3 -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Services</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Boost réseaux</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Comptes premium</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Formations</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Tutoriels</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Services numériques</a></li>
                    </ul>
                </div>
                
                <!-- Column 4 -->
                <div>
                    <h3 class="text-lg font-semibold mb-4">Contact & Légal</h3>
                    <ul class="space-y-2">
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Mentions légales</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">CGU</a></li>
                        <li><a href="politiques.html" class="text-gray-400 hover:text-white transition duration-300">Politique de confidentialité</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">FAQ</a></li>
                        <li><a href="#" class="text-gray-400 hover:text-white transition duration-300">Support</a></li>
                    </ul>
                </div>
            </div>
            
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>IZYBOOST n'est pas affilié à Instagram, TikTok, YouTube ou toute autre plateforme mentionnée.</p>
            </div>
        </div>
    </footer>

    <!-- Service Modal -->
    <div id="service-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h3 id="modal-title" class="text-xl font-bold text-gray-800">Détails du service</h3>
                <button id="close-modal" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            <div id="modal-content" class="mb-6">
                <!-- Content will be inserted here -->
            </div>
            <div class="flex justify-end">
                <a href="https://wa.me/237676676120?text=salut.%20je%20viens%20de%20izyboost%20et%20je%20suis%20interesse%20par%20l%27un%20de%20vos%20services" class="btn-primary">
                    Commander sur WhatsApp
                </a>
            </div>
        </div>
    </div>

    <script>
        // Mobile Menu Toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const closeMobileMenu = document.getElementById('close-mobile-menu');
        const mobileMenu = document.getElementById('mobile-menu');
        
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.add('open');
        });
        
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.remove('open');
            }
        });
        
        // Hero Carousel
        const carouselSlides = document.querySelectorAll('.carousel-slide');
        const carouselIndicators = document.querySelectorAll('.carousel-indicator');
        const carouselPrev = document.querySelector('.carousel-prev');
        const carouselNext = document.querySelector('.carousel-next');
        let currentSlide = 0;
        
        function showSlide(index) {
            // Hide all slides
            carouselSlides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all indicators
            carouselIndicators.forEach(indicator => {
                indicator.classList.remove('active');
            });
            
            // Show current slide and activate indicator
            carouselSlides[index].classList.add('active');
            carouselIndicators[index].classList.add('active');
            
            // Update current slide index
            currentSlide = index;
        }
        
        // Next slide
        function nextSlide() {
            let nextIndex = (currentSlide + 1) % carouselSlides.length;
            showSlide(nextIndex);
        }
        
        // Previous slide
        function prevSlide() {
            let prevIndex = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length;
            showSlide(prevIndex);
        }
        
        // Event listeners for navigation
        carouselNext.addEventListener('click', nextSlide);
        carouselPrev.addEventListener('click', prevSlide);
        
        // Event listeners for indicators
        carouselIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Auto slide change
        let carouselInterval = setInterval(nextSlide, 5000);
        
        // Pause auto slide on hover
        const heroCarousel = document.querySelector('.hero-carousel');
        heroCarousel.addEventListener('mouseenter', () => {
            clearInterval(carouselInterval);
        });
        
        heroCarousel.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(nextSlide, 5000);
        });
        
        // Scroll Animation
        function checkScroll() {
            const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
            
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementPosition < windowHeight - 100) {
                    element.classList.add('appear');
                }
            });
        }
        
        window.addEventListener('scroll', checkScroll);
        window.addEventListener('load', checkScroll);
        
        // Stats Counter
        const statNumbers = document.querySelectorAll('.stat-number');
        
        function animateCounter(element, target) {
            let current = 0;
            const increment = target / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                element.textContent = Math.floor(current);
            }, 20);
        }
        
        function initCounters() {
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
        }
        
        // Initialize counters when stats section is in view
        const statsSection = document.querySelector('.bg-white');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
        
        // Interactive Tabs
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding content
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Service Modal
        const serviceModal = document.getElementById('service-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const closeModal = document.getElementById('close-modal');
        const serviceButtons = document.querySelectorAll('.btn-service, .btn-account, .btn-training');
        
        serviceButtons.forEach(button => {
            button.addEventListener('click', () => {
                let serviceType = '';
                let serviceName = '';
                
                if (button.classList.contains('btn-service')) {
                    serviceType = 'Service';
                    serviceName = button.getAttribute('data-service');
                } else if (button.classList.contains('btn-account')) {
                    serviceType = 'Compte';
                    serviceName = button.getAttribute('data-account');
                } else if (button.classList.contains('btn-training')) {
                    serviceType = 'Formation';
                    serviceName = button.getAttribute('data-training');
                }
                
                modalTitle.textContent = serviceName;
                modalContent.innerHTML = `
                    <p class="text-gray-600 mb-4">Vous êtes intéressé par notre ${serviceType.toLowerCase()} <strong>${serviceName}</strong>.</p>
                    <p class="text-gray-600">Cliquez sur le bouton ci-dessous pour nous contacter sur WhatsApp et passer commande.</p>
                `;
                
                serviceModal.classList.remove('hidden');
            });
        });
        
        closeModal.addEventListener('click', () => {
            serviceModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === serviceModal) {
                serviceModal.classList.add('hidden');
            }
        });
        
        // Form Submissions
        const testimonialForm = document.getElementById('testimonial-form');
        const contactForm = document.getElementById('contact-form');
        
        testimonialForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, you would send the data to a server here
            alert('Merci pour votre avis ! Il sera publié après modération.');
            testimonialForm.reset();
        });
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // In a real application, you would send the data to a server here
            alert('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            contactForm.reset();
        });
        
        // Rating System
        const ratingInputs = document.querySelectorAll('.rating input');
        
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => {
                const ratingValue = input.value;
                const stars = document.querySelectorAll('.rating label i');
                
                stars.forEach((star, index) => {
                    if (index < ratingValue) {
                        star.classList.remove('far');
                        star.classList.add('fas');
                    } else {
                        star.classList.remove('fas');
                        star.classList.add('far');
                    }
                });
            });
        });
        
        // Initialize rating stars
        document.querySelectorAll('.rating label i').forEach(star => {
            star.classList.add('far');
        });
    </script>
</body>
</html>