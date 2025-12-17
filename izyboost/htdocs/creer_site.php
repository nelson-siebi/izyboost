<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Créer mon site web - IzyBoost</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #3498db;
            --primary-dark: #2980b9;
            --secondary-color: #2c3e50;
            --accent-color: #9b59b6;
            --light-color: #ecf0f1;
            --success-color: #2ecc71;
            --warning-color: #f39c12;
            --danger-color: #e74c3c;
            --shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            --transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            --gradient: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: var(--gradient);
            color: white;
            border-radius: 20px;
            box-shadow: var(--shadow);
            animation: fadeIn 1s ease, float 6s ease-in-out infinite;
            position: relative;
            overflow: hidden;
        }

        header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
            animation: pulse 8s infinite linear;
        }

        header h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        header p {
            font-size: 1.3rem;
            max-width: 800px;
            margin: 0 auto 25px;
            opacity: 0.9;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 15px 30px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: 600;
            text-decoration: none;
            transition: var(--transition);
            box-shadow: var(--shadow);
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.7s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
        }

        .btn-primary {
            background: var(--gradient);
        }

        .btn-success {
            background-color: var(--success-color);
        }

        .btn-large {
            padding: 18px 40px;
            font-size: 1.3rem;
        }

        .step-container {
            display: none;
            background-color: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
            animation: slideIn 0.6s ease;
            position: relative;
            overflow: hidden;
        }

        .step-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: var(--gradient);
        }

        .step-container.active {
            display: block;
        }

        .step-header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid var(--light-color);
        }

        .step-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50px;
            height: 50px;
            background: var(--gradient);
            color: white;
            border-radius: 50%;
            font-weight: bold;
            font-size: 1.3rem;
            margin-right: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .step-title {
            font-size: 1.8rem;
            color: var(--secondary-color);
        }

        .form-group {
            margin-bottom: 25px;
            animation: fadeInUp 0.5s ease;
        }

        label {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            font-weight: 600;
            color: var(--secondary-color);
            font-size: 1.1rem;
        }

        label i {
            color: var(--primary-color);
        }

        input, select, textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5eb;
            border-radius: 10px;
            font-size: 1rem;
            transition: var(--transition);
            background-color: #f8f9fa;
        }

        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
            background-color: white;
        }

        .checkbox-group, .radio-group {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }

        .option-card {
            border: 2px solid #e1e5eb;
            border-radius: 15px;
            padding: 25px;
            cursor: pointer;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            background: white;
        }

        .option-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 0;
            background: var(--gradient);
            transition: height 0.3s ease;
        }

        .option-card:hover::before {
            height: 100%;
        }

        .option-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
            border-color: var(--primary-color);
        }

        .option-card.selected {
            border-color: var(--primary-color);
            background-color: rgba(52, 152, 219, 0.05);
            transform: translateY(-5px);
        }

        .option-card.selected::before {
            height: 100%;
        }

        .option-icon {
            font-size: 2.5rem;
            color: var(--primary-color);
            margin-bottom: 15px;
        }

        .option-card h3 {
            margin-bottom: 12px;
            color: var(--secondary-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .option-card p {
            color: #666;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }

        .option-price {
            font-weight: bold;
            color: var(--primary-color);
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .info-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            background-color: var(--primary-color);
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            font-size: 0.8rem;
            margin-left: 8px;
            cursor: pointer;
            transition: var(--transition);
        }

        .info-icon:hover {
            background-color: var(--primary-dark);
            transform: scale(1.1);
        }

        .tooltip {
            position: absolute;
            top: 15px;
            right: 15px;
            background-color: var(--secondary-color);
            color: white;
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 0.85rem;
            width: 250px;
            z-index: 10;
            display: none;
            box-shadow: var(--shadow);
            animation: fadeIn 0.3s ease;
        }

        .info-icon:hover + .tooltip {
            display: block;
        }

        .preview-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 25px;
            margin-top: 25px;
            text-align: center;
            border: 2px dashed #ced4da;
            transition: var(--transition);
        }

        .preview-container:hover {
            border-color: var(--primary-color);
        }

        .preview-logo {
            max-width: 180px;
            max-height: 180px;
            margin: 0 auto 20px;
            display: block;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transition: var(--transition);
        }

        .preview-logo:hover {
            transform: scale(1.05);
        }

        .preview-site-name {
            font-size: 1.8rem;
            font-weight: bold;
            color: var(--secondary-color);
            margin-bottom: 10px;
        }

        .price-summary {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            padding: 25px;
            margin-top: 25px;
            border-left: 5px solid var(--primary-color);
        }

        .price-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #dee2e6;
            animation: fadeInLeft 0.5s ease;
        }

        .price-total {
            display: flex;
            justify-content: space-between;
            font-size: 1.5rem;
            font-weight: bold;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid var(--secondary-color);
            animation: pulse 2s infinite;
        }

        .navigation-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }

        .progress-bar {
            height: 12px;
            background-color: #e9ecef;
            border-radius: 10px;
            margin: 40px 0;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .progress {
            height: 100%;
            background: var(--gradient);
            width: 0%;
            transition: width 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
        }

        .progress::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
            animation: shimmer 2s infinite;
        }

        .success-message {
            text-align: center;
            padding: 60px 40px;
            display: none;
            animation: bounceIn 1s ease;
        }

        .success-icon {
            font-size: 5rem;
            color: var(--success-color);
            margin-bottom: 25px;
            animation: tada 1s ease;
        }

        .domain-options {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 15px;
        }

        .domain-option {
            border: 2px solid #e1e5eb;
            border-radius: 15px;
            padding: 20px;
            cursor: pointer;
            transition: var(--transition);
            text-align: center;
        }

        .domain-option:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .domain-option.selected {
            border-color: var(--success-color);
            background-color: rgba(46, 204, 113, 0.05);
        }

        .domain-price {
            font-size: 1.5rem;
            font-weight: bold;
            margin: 10px 0;
        }

        .free {
            color: var(--success-color);
        }

        .paid {
            color: var(--primary-color);
        }

        .image-preview {
            width: 100%;
            height: 200px;
            border: 2px dashed #ced4da;
            border-radius: 10px;
            margin-top: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-color: #f8f9fa;
            transition: var(--transition);
        }

        .image-preview:hover {
            border-color: var(--primary-color);
        }

        .image-preview img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .image-preview span {
            color: #6c757d;
        }

        .feature-highlight {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            background: rgba(52, 152, 219, 0.05);
            border-radius: 10px;
            margin-bottom: 15px;
            transition: var(--transition);
        }

        .feature-highlight:hover {
            background: rgba(52, 152, 219, 0.1);
            transform: translateX(10px);
        }

        .feature-icon {
            font-size: 2rem;
            color: var(--primary-color);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeInLeft {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
        }

        @keyframes bounceIn {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); }
        }

        @keyframes tada {
            0% { transform: scale(1); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0); }
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        @media (max-width: 768px) {
            .checkbox-group, .domain-options {
                grid-template-columns: 1fr;
            }
            
            .navigation-buttons {
                flex-direction: column;
                gap: 15px;
            }
            
            .navigation-buttons .btn {
                width: 100%;
            }
            
            header h1 {
                font-size: 2.2rem;
            }
            
            header p {
                font-size: 1.1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1><i class="fas fa-rocket"></i> Crée ton site de boostage en quelques clics !</h1>
            <p>Configurez votre propre plateforme de services de boostage comme IzyBoost. Choisissez les fonctionnalités, personnalisez l'apparence et lancez-vous !</p>
            <div class="feature-highlight">
                <div class="feature-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <div>
                    <h3>Prix maximum: 20 000 FCFA</h3>
                    <p>Même en sélectionnant toutes les options, vous ne paierez jamais plus de 20 000 FCFA !</p>
                </div>
            </div>
        </header>

        <div class="progress-bar">
            <div class="progress" id="progress"></div>
        </div>

        <!-- Étape 1: Introduction -->
        <div class="step-container active" id="step1">
            <div class="step-header">
                <div class="step-number">1</div>
                <h2 class="step-title">Bienvenue dans le créateur de site</h2>
            </div>
            <div style="text-align: center; padding: 40px 0;">
                <div style="font-size: 5rem; color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <h3 style="margin-bottom: 20px; font-size: 1.8rem;">Prêt à créer votre site de boostage ?</h3>
                <p style="margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto; font-size: 1.1rem;">
                    En quelques étapes simples, vous allez configurer votre plateforme de services de boostage. 
                    Personnalisez l'apparence, choisissez les fonctionnalités et définissez votre modèle d'affaires.
                    Notre assistant vous guidera tout au long du processus.
                </p>
                <button class="btn btn-primary btn-large pulse" id="startBtn">
                    <i class="fas fa-play-circle"></i> Commencer la création
                </button>
            </div>
        </div>

        <!-- Étape 2: Détails du site -->
        <div class="step-container" id="step2">
            <div class="step-header">
                <div class="step-number">2</div>
                <h2 class="step-title">Détails de votre site</h2>
            </div>
            
            <div class="form-group">
                <label for="siteName"><i class="fas fa-signature"></i> Nom du site</label>
                <input type="text" id="siteName" placeholder="Ex: EliteBoost, ProGamingServices...">
            </div>
            
            <div class="form-group">
                <label for="siteLogo"><i class="fas fa-image"></i> Logo du site</label>
                <input type="file" id="siteLogo" accept="image/*">
                <small>Format recommandé: PNG, JPG (max 2MB)</small>
                <div class="image-preview" id="logoPreview">
                    <span><i class="fas fa-cloud-upload-alt"></i> Aperçu du logo</span>
                </div>
            </div>
            
            <div class="form-group">
                <label for="siteDescription"><i class="fas fa-align-left"></i> Description du site</label>
                <textarea id="siteDescription" rows="4" placeholder="Décrivez brièvement votre site de boostage..."></textarea>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-globe"></i> Nom de domaine</label>
                <p>Choisissez comment votre site sera accessible sur internet</p>
                
                <div class="domain-options">
                    <div class="domain-option" data-price="0">
                        <div style="font-size: 2.5rem; color: var(--success-color); margin-bottom: 10px;">
                            <i class="fas fa-server"></i>
                        </div>
                        <h3>Hébergement IzyBoost</h3>
                        <p>Votre site sera hébergé sur nos serveurs</p>
                        <div class="domain-price free">Gratuit</div>
                        <small>Ex: monboost.izyboost.com</small>
                    </div>
                    
                    <div class="domain-option" data-price="5000">
                        <div style="font-size: 2.5rem; color: var(--primary-color); margin-bottom: 10px;">
                            <i class="fas fa-link"></i>
                        </div>
                        <h3>Domaine personnalisé</h3>
                        <p>Utilisez votre propre nom de domaine</p>
                        <div class="domain-price paid">+ 5 000 FCFA</div>
                        <small>Ex: monboost.com</small>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="siteColor"><i class="fas fa-palette"></i> Couleur principale</label>
                <input type="color" id="siteColor" value="#3498db">
            </div>
            
            <div class="preview-container">
                <h3><i class="fas fa-eye"></i> Aperçu de votre site</h3>
                <div id="sitePreview">
                    <div class="preview-site-name" id="previewName">Nom du site</div>
                    <div id="previewDescription">Description du site</div>
                </div>
            </div>
            
            <div class="navigation-buttons">
                <button class="btn" id="backToStep1">
                    <i class="fas fa-arrow-left"></i> Précédent
                </button>
                <button class="btn btn-primary" id="toStep3">
                    Suivant <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <!-- Étape 3: Fonctionnalités -->
        <div class="step-container" id="step3">
            <div class="step-header">
                <div class="step-number">3</div>
                <h2 class="step-title">Fonctionnalités de votre site</h2>
            </div>
            <p>Sélectionnez les fonctionnalités que vous souhaitez intégrer à votre site. Chaque option a un impact sur le prix final.</p>
            
            <div class="checkbox-group">
                <!-- Option 1 -->
                <div class="option-card" data-price="2000">
                    <div class="option-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>Système de parrainage <span class="info-icon">i</span><span class="tooltip">Permet à vos utilisateurs d'inviter des amis et de gagner des commissions ou des bonus.</span></h3>
                    <p>Créez un programme de référence pour augmenter votre base d'utilisateurs.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 2 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 2 -->
                <div class="option-card" data-price="3000">
                    <div class="option-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <h3>Historique des transactions <span class="info-icon">i</span><span class="tooltip">Chaque utilisateur peut consulter l'historique complet de ses transactions.</span></h3>
                    <p>Transparence totale pour vos clients sur leurs activités financières.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 3 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 3 -->
                <div class="option-card" data-price="2000">
                    <div class="option-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h3>Historique des commandes <span class="info-icon">i</span><span class="tooltip">Les utilisateurs peuvent suivre toutes leurs commandes passées et en cours.</span></h3>
                    <p>Gestion complète du cycle de vie des commandes pour vos clients.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 2 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 4 -->
                <div class="option-card" data-price="5000">
                    <div class="option-icon">
                        <i class="fas fa-tachometer-alt"></i>
                    </div>
                    <h3>Tableau de bord administrateur <span class="info-icon">i</span><span class="tooltip">Interface complète pour gérer utilisateurs, commandes, statistiques et paramètres.</span></h3>
                    <p>Contrôle total sur votre plateforme avec un back-office complet.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 5 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 5 -->
                <div class="option-card" data-price="3000">
                    <div class="option-icon">
                        <i class="fas fa-home"></i>
                    </div>
                    <h3>Page d'accueil personnalisable <span class="info-icon">i</span><span class="tooltip">Modifiez facilement le contenu de votre page d'accueil sans compétences techniques.</span></h3>
                    <p>Adaptez votre site à votre image avec un éditeur visuel intuitif.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 3 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 6 -->
                <div class="option-card" data-price="1000">
                    <div class="option-icon">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                    <h3>Chat WhatsApp intégré <span class="info-icon">i</span><span class="tooltip">Permet à vos clients de vous contacter directement via WhatsApp.</span></h3>
                    <p>Communication directe et instantanée avec votre support.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 1 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 7 -->
                <div class="option-card" data-price="2000">
                    <div class="option-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3>Système de support/tickets <span class="info-icon">i</span><span class="tooltip">Gestion organisée des demandes d'assistance avec suivi des tickets.</span></h3>
                    <p>Offrez un support professionnel à vos clients.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 2 000 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 8 -->
                <div class="option-card" data-price="1500">
                    <div class="option-icon">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3>Mode premium sans publicité <span class="info-icon">i</span><span class="tooltip">Votre site sera entièrement exempt de publicités et bannières.</span></h3>
                    <p>Expérience utilisateur premium sans distractions publicitaires.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 1 500 FCFA</span>
                    </div>
                </div>
                
                <!-- Option 9 -->
                <div class="option-card" data-price="4000">
                    <div class="option-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3>Paiements mobiles (Orange/MTN) <span class="info-icon">i</span><span class="tooltip">Intégration des paiements mobiles money pour faciliter les transactions.</span></h3>
                    <p>Acceptez les paiements via Orange Money et MTN Mobile Money.</p>
                    <div class="option-price">
                        <span>Prix:</span>
                        <span>+ 4 000 FCFA</span>
                    </div>
                </div>
            </div>
            
            <div class="navigation-buttons">
                <button class="btn" id="backToStep2">
                    <i class="fas fa-arrow-left"></i> Précédent
                </button>
                <button class="btn btn-primary" id="toStep4">
                    Suivant <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <!-- Étape 4: Informations administrateur -->
        <div class="step-container" id="step4">
            <div class="step-header">
                <div class="step-number">4</div>
                <h2 class="step-title">Vos informations administrateur</h2>
            </div>
            <p>Ces informations vous permettront de vous connecter à votre tableau de bord administrateur.</p>
            
            <div class="form-group">
                <label for="adminName"><i class="fas fa-user"></i> Nom complet</label>
                <input type="text" id="adminName" placeholder="Votre nom complet">
            </div>
            
            <div class="form-group">
                <label for="adminEmail"><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="adminEmail" placeholder="votre@email.com">
            </div>
            
            <div class="form-group">
                <label for="adminPassword"><i class="fas fa-lock"></i> Mot de passe</label>
                <input type="password" id="adminPassword" placeholder="Créez un mot de passe sécurisé">
            </div>
            
            <div class="form-group">
                <label for="confirmPassword"><i class="fas fa-lock"></i> Confirmer le mot de passe</label>
                <input type="password" id="confirmPassword" placeholder="Répétez votre mot de passe">
            </div>
            
            <div class="form-group">
                <label for="adminPhone"><i class="fas fa-phone"></i> Téléphone</label>
                <input type="tel" id="adminPhone" placeholder="Votre numéro de téléphone">
            </div>
            
            <div class="form-group">
                <label for="adminCountry"><i class="fas fa-flag"></i> Pays</label>
                <select id="adminCountry">
                    <option value="cm">Cameroun</option>
                    <option value="ci">Côte d'Ivoire</option>
                    <option value="sn">Sénégal</option>
                    <option value="ga">Gabon</option>
                    <option value="other">Autre</option>
                </select>
            </div>
            
            <div class="navigation-buttons">
                <button class="btn" id="backToStep3">
                    <i class="fas fa-arrow-left"></i> Précédent
                </button>
                <button class="btn btn-primary" id="toStep5">
                    Suivant <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>

        <!-- Étape 5: Résumé et paiement -->
        <div class="step-container" id="step5">
            <div class="step-header">
                <div class="step-number">5</div>
                <h2 class="step-title">Résumé et paiement</h2>
            </div>
            
            <div class="price-summary">
                <h3><i class="fas fa-file-invoice-dollar"></i> Récapitulatif de votre commande</h3>
                
                <div class="price-item">
                    <span>Création du site (structure de base)</span>
                    <span>10 000 FCFA</span>
                </div>
                
                <div id="selectedOptions">
                    <!-- Les options sélectionnées seront ajoutées ici dynamiquement -->
                </div>
                
                <div class="price-item">
                    <span>Hébergement et maintenance (premier mois)</span>
                    <span>5 000 FCFA</span>
                </div>
                
                <div class="price-total">
                    <span>Total à payer</span>
                    <span id="totalPrice">15 000 FCFA</span>
                </div>
                
                <div class="price-item" style="margin-top: 15px; font-style: italic;">
                    <span>À partir du 2ème mois:</span>
                    <span id="monthlyPrice">5 000 FCFA/mois</span>
                </div>
            </div>
            
            <div class="form-group" style="margin-top: 30px;">
                <label for="paymentMethod"><i class="fas fa-credit-card"></i> Méthode de paiement</label>
                <select id="paymentMethod">
                    <option value="orange">Orange Money</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="card">Carte bancaire</option>
                    <option value="bank">Virement bancaire</option>
                </select>
            </div>
            
            <div class="navigation-buttons">
                <button class="btn" id="backToStep4">
                    <i class="fas fa-arrow-left"></i> Précédent
                </button>
                <button class="btn btn-success" id="submitOrder">
                    <i class="fas fa-check-circle"></i> Commander mon site
                </button>
            </div>
        </div>

        <!-- Message de succès -->
        <div class="step-container success-message" id="successMessage">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Félicitations ! Votre site est en cours de création</h2>
            <p>Nous avons bien reçu votre commande. Notre équipe va maintenant créer votre site de boostage selon vos spécifications.</p>
            <p>Vous recevrez un email de confirmation dans les prochaines minutes avec les détails de connexion à votre tableau d'administration.</p>
            <button class="btn btn-primary" style="margin-top: 20px;" onclick="window.location.href='/'">
                <i class="fas fa-home"></i> Retour à l'accueil
            </button>
        </div>
    </div>

    <script>
        // Variables globales
        let currentStep = 1;
        const totalSteps = 5;
        const basePrice = 10000;
        const monthlyPrice = 5000;
        const maxPrice = 20000;
        let selectedOptions = [];
        let selectedDomainOption = { price: 0 };
        let totalPrice = basePrice + monthlyPrice;

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            updateProgressBar();
            setupEventListeners();
            updatePriceSummary();
        });

        // Configuration des écouteurs d'événements
        function setupEventListeners() {
            // Boutons de navigation
            document.getElementById('startBtn').addEventListener('click', function() {
                goToStep(2);
            });
            
            document.getElementById('toStep3').addEventListener('click', function() {
                goToStep(3);
            });
            
            document.getElementById('toStep4').addEventListener('click', function() {
                goToStep(4);
            });
            
            document.getElementById('toStep5').addEventListener('click', function() {
                goToStep(5);
            });
            
            document.getElementById('backToStep1').addEventListener('click', function() {
                goToStep(1);
            });
            
            document.getElementById('backToStep2').addEventListener('click', function() {
                goToStep(2);
            });
            
            document.getElementById('backToStep3').addEventListener('click', function() {
                goToStep(3);
            });
            
            document.getElementById('backToStep4').addEventListener('click', function() {
                goToStep(4);
            });
            
            // Bouton de soumission finale
            document.getElementById('submitOrder').addEventListener('click', function() {
                submitOrder();
            });
            
            // Mise à jour de l'aperçu du site
            document.getElementById('siteName').addEventListener('input', updateSitePreview);
            document.getElementById('siteDescription').addEventListener('input', updateSitePreview);
            document.getElementById('siteColor').addEventListener('input', updateSitePreview);
            
            // Gestion de l'upload d'image
            document.getElementById('siteLogo').addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" alt="Logo preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Gestion des options de domaine
            const domainOptions = document.querySelectorAll('.domain-option');
            domainOptions.forEach(option => {
                option.addEventListener('click', function() {
                    domainOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    selectedDomainOption = {
                        price: parseInt(this.getAttribute('data-price')),
                        type: this.querySelector('h3').textContent
                    };
                    
                    updatePriceSummary();
                });
            });
            
            // Gestion des options de fonctionnalités
            const optionCards = document.querySelectorAll('.option-card');
            optionCards.forEach(card => {
                card.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    
                    const price = parseInt(this.getAttribute('data-price'));
                    const title = this.querySelector('h3').textContent.trim();
                    
                    if (this.classList.contains('selected')) {
                        selectedOptions.push({title, price});
                    } else {
                        selectedOptions = selectedOptions.filter(option => option.title !== title);
                    }
                    
                    updatePriceSummary();
                });
            });
        }

        // Navigation entre les étapes
        function goToStep(step) {
            document.querySelectorAll('.step-container').forEach(container => {
                container.classList.remove('active');
            });
            
            document.getElementById(`step${step}`).classList.add('active');
            currentStep = step;
            updateProgressBar();
            
            // Animation de pulse pour le bouton de démarrage
            if (step === 1) {
                document.getElementById('startBtn').classList.add('pulse');
            } else {
                document.getElementById('startBtn').classList.remove('pulse');
            }
        }

        // Mise à jour de la barre de progression
        function updateProgressBar() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progress').style.width = `${progress}%`;
        }

        // Mise à jour de l'aperçu du site
        function updateSitePreview() {
            const siteName = document.getElementById('siteName').value || 'Nom du site';
            const siteDescription = document.getElementById('siteDescription').value || 'Description du site';
            const siteColor = document.getElementById('siteColor').value;
            
            document.getElementById('previewName').textContent = siteName;
            document.getElementById('previewDescription').textContent = siteDescription;
            document.getElementById('previewName').style.color = siteColor;
        }

        // Mise à jour du récapitulatif des prix
        function updatePriceSummary() {
            let optionsTotal = 0;
            let optionsHTML = '';
            
            selectedOptions.forEach(option => {
                optionsTotal += option.price;
                optionsHTML += `
                    <div class="price-item">
                        <span>${option.title}</span>
                        <span>+ ${option.price.toLocaleString()} FCFA</span>
                    </div>
                `;
            });
            
            // Ajouter l'option de domaine sélectionnée
            if (selectedDomainOption.price > 0) {
                optionsHTML += `
                    <div class="price-item">
                        <span>${selectedDomainOption.type}</span>
                        <span>+ ${selectedDomainOption.price.toLocaleString()} FCFA</span>
                    </div>
                `;
                optionsTotal += selectedDomainOption.price;
            }
            
            document.getElementById('selectedOptions').innerHTML = optionsHTML;
            
            // Calcul du prix total avec plafond à maxPrice
            totalPrice = basePrice + monthlyPrice + optionsTotal;
            if (totalPrice > maxPrice) {
                totalPrice = maxPrice;
            }
            
            document.getElementById('totalPrice').textContent = `${totalPrice.toLocaleString()} FCFA`;
        }

        // Soumission de la commande
// Soumission de la commande
function submitOrder() {
    // Validation des champs obligatoires
    const adminName = document.getElementById('adminName').value;
    const adminEmail = document.getElementById('adminEmail').value;
    const adminPassword = document.getElementById('adminPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!adminName || !adminEmail || !adminPassword) {
        showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
    }
    
    if (adminPassword !== confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas.', 'error');
        return;
    }

    // Récupération de toutes les données du formulaire
    const formData = new FormData();
    
    // Détails du site
    formData.append('siteName', document.getElementById('siteName').value);
    formData.append('siteDescription', document.getElementById('siteDescription').value);
    formData.append('siteColor', document.getElementById('siteColor').value);
    formData.append('domainType', selectedDomainOption.type);
    formData.append('domainPrice', selectedDomainOption.price);
    
    // Logo du site
    const logoFile = document.getElementById('siteLogo').files[0];
    if (logoFile) {
        formData.append('siteLogo', logoFile);
    }
    
    // Fonctionnalités sélectionnées
    formData.append('features', JSON.stringify(selectedOptions));
    
    // Informations administrateur
    formData.append('adminName', adminName);
    formData.append('adminEmail', adminEmail);
    formData.append('adminPhone', document.getElementById('adminPhone').value);
    formData.append('adminCountry', document.getElementById('adminCountry').value);
    
    // Paiement
    formData.append('paymentMethod', document.getElementById('paymentMethod').value);
    formData.append('totalPrice', totalPrice);
    formData.append('monthlyPrice', monthlyPrice);

    // Afficher un indicateur de chargement
    const submitBtn = document.getElementById('submitOrder');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
    submitBtn.disabled = true;

    // Envoi des données au backend
    fetch('backend/create-site.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('step5').classList.remove('active');
            document.getElementById('successMessage').style.display = 'block';
            showNotification(data.message, 'success');
        } else {
            showNotification(data.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        showNotification('Une erreur est survenue lors de la création du site.', 'error');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// Fonction pour afficher les notifications
function showNotification(message, type) {
    // Créer une notification toast
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}
    </script>
</body>
</html>