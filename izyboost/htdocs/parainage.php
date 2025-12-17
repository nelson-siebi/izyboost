<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Programme de Parrainage IzyBoost</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        :root {
            --primary-color: #4a6bff;
            --secondary-color: #f8f9fa;
            --accent-color: #ff6b6b;
            --text-color: #333;
            --light-text: #6c757d;
            --white: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--secondary-color);
            color: var(--text-color);
            line-height: 1.6;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            background-color: var(--primary-color);
            color: var(--white);
            padding: 30px 0;
            text-align: center;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 1.1rem;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .section {
            background-color: var(--white);
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .section-title {
            color: var(--primary-color);
            margin-bottom: 20px;
            font-size: 1.8rem;
            display: flex;
            align-items: center;
        }
        
        .section-title i {
            margin-right: 10px;
        }
        
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .benefit-card {
            background-color: var(--secondary-color);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--accent-color);
        }
        
        .benefit-card h3 {
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .referral-link-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .referral-input-group {
            display: flex;
            width: 100%;
        }
        
        .referral-input {
            flex: 1;
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 5px 0 0 5px;
            font-size: 1rem;
        }
        
        .copy-btn {
            background-color: var(--primary-color);
            color: var(--white);
            border: none;
            padding: 0 20px;
            border-radius: 0 5px 5px 0;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        
        .copy-btn:hover {
            background-color: #3a5ae8;
        }
        
        .social-share {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 15px;
            border-radius: 5px;
            color: var(--white);
            text-decoration: none;
            font-weight: bold;
            transition: transform 0.2s;
        }
        
        .social-btn:hover {
            transform: translateY(-2px);
        }
        
        .facebook {
            background-color: #3b5998;
        }
        
        .twitter {
            background-color: #1da1f2;
        }
        
        .whatsapp {
            background-color: #25d366;
        }
        
        .linkedin {
            background-color: #0077b5;
        }
        
        .email {
            background-color: var(--light-text);
        }
        
        .referrals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        .referrals-table th, .referrals-table td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .referrals-table th {
            background-color: var(--primary-color);
            color: var(--white);
        }
        
        .referrals-table tr:nth-child(even) {
            background-color: var(--secondary-color);
        }
        
        .referrals-table tr:hover {
            background-color: #e9ecef;
        }
        
        .balance-card {
            background: linear-gradient(135deg, var(--primary-color), #6a5acd);
            color: var(--white);
            padding: 25px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .balance-amount {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 15px 0;
        }
        
        .withdraw-btn {
            background-color: var(--white);
            color: var(--primary-color);
            border: none;
            padding: 12px 25px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .withdraw-btn:hover {
            background-color: #e0e0e0;
            transform: translateY(-2px);
        }
        
        .steps {
            display: flex;
            flex-direction: column;
            gap: 20px;
            counter-reset: step-counter;
        }
        
        .step {
            display: flex;
            gap: 15px;
            position: relative;
            padding-left: 60px;
        }
        
        .step::before {
            counter-increment: step-counter;
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            width: 40px;
            height: 40px;
            background-color: var(--primary-color);
            color: var(--white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.2rem;
        }
        
        .step-content h3 {
            margin-bottom: 5px;
            color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 2rem;
            }
            
            .benefits-grid {
                grid-template-columns: 1fr;
            }
            
            .referral-input-group {
                flex-direction: column;
            }
            
            .referral-input {
                border-radius: 5px 5px 0 0;
            }
            
            .copy-btn {
                border-radius: 0 0 5px 5px;
                padding: 12px;
            }
            
            .referrals-table {
                display: block;
                overflow-x: auto;
            }
        }
        
        .success-message {
            display: none;
            background-color: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Programme de Parrainage IzyBoost</h1>
            <p>Gagnez des récompenses en parrainant vos amis et collègues. Partagez votre lien de parrainage et bénéficiez d'avantages exclusifs à chaque inscription.</p>
        </header>
        
        <div class="balance-card">
            <h2>Votre Solde de Parrainage</h2>
            <div class="balance-amount">€150.00</div>
            <p>Montant disponible pour retrait</p>
            <button class="withdraw-btn">Demander un Retrait</button>
        </div>
        
        <section class="section">
            <h2 class="section-title"><i class="fas fa-gift"></i> Vos Avantages</h2>
            <div class="benefits-grid">
                <div class="benefit-card">
                    <h3>Prime d'Inscription</h3>
                    <p>Recevez €10 immédiatement après l'inscription de votre filleul et sa première commande.</p>
                </div>
                <div class="benefit-card">
                    <h3>Commission Récurrente</h3>
                    <p>Gagnez 5% sur chaque achat que votre filleul effectue pendant 12 mois.</p>
                </div>
                <div class="benefit-card">
                    <h3>Bonus de Niveau</h3>
                    <p>Obtenez €50 quand vous atteignez 10 filleuls actifs dans votre réseau.</p>
                </div>
                <div class="benefit-card">
                    <h3>Programme à 2 Niveaux</h3>
                    <p>Gagnez 2.5% supplémentaire sur les filleuls de vos filleuls (2ème niveau).</p>
                </div>
            </div>
        </section>
        
        <section class="section">
            <h2 class="section-title"><i class="fas fa-link"></i> Votre Lien de Parrainage</h2>
            <div class="referral-link-container">
                <p>Partagez ce lien unique avec vos amis et commencez à gagner des récompenses :</p>
                <div class="referral-input-group">
                    <input type="text" id="referralLink" class="referral-input" value="https://izyboost.com/ref/user123" readonly>
                    <button class="copy-btn" onclick="copyReferralLink()">Copier</button>
                </div>
                <div id="successMessage" class="success-message">
                    Lien copié dans le presse-papiers !
                </div>
                <p>Ou partagez directement sur :</p>
                <div class="social-share">
                    <a href="#" class="social-btn facebook"><i class="fab fa-facebook-f"></i> Facebook</a>
                    <a href="#" class="social-btn twitter"><i class="fab fa-twitter"></i> Twitter</a>
                    <a href="#" class="social-btn whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    <a href="#" class="social-btn linkedin"><i class="fab fa-linkedin-in"></i> LinkedIn</a>
                    <a href="#" class="social-btn email"><i class="fas fa-envelope"></i> Email</a>
                </div>
            </div>
        </section>
        
        <section class="section">
            <h2 class="section-title"><i class="fas fa-question-circle"></i> Comment ça marche ?</h2>
            <div class="steps">
                <div class="step">
                    <div class="step-content">
                        <h3>Partagez votre lien</h3>
                        <p>Copiez votre lien unique ou partagez-le directement sur vos réseaux sociaux, par email ou messagerie.</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-content">
                        <h3>Vos amis s'inscrivent</h3>
                        <p>Vos contacts utilisent votre lien pour s'inscrire sur IzyBoost et effectuent leur première commande.</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-content">
                        <h3>Recevez vos récompenses</h3>
                        <p>Dès que la condition est remplie, votre compte est crédité automatiquement.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="section">
            <h2 class="section-title"><i class="fas fa-list-ul"></i> Vos Filleuls</h2>
            <table class="referrals-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Date d'Inscription</th>
                        <th>Statut</th>
                        <th>Gains</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Jean Dupont</td>
                        <td>15/06/2023</td>
                        <td>Actif</td>
                        <td>€42.50</td>
                    </tr>
                    <tr>
                        <td>Marie Martin</td>
                        <td>22/05/2023</td>
                        <td>Actif</td>
                        <td>€37.80</td>
                    </tr>
                    <tr>
                        <td>Pierre Lambert</td>
                        <td>10/05/2023</td>
                        <td>En attente</td>
                        <td>€0.00</td>
                    </tr>
                    <tr>
                        <td>Sophie Leroy</td>
                        <td>03/04/2023</td>
                        <td>Actif</td>
                        <td>€28.90</td>
                    </tr>
                    <tr>
                        <td>Thomas Moreau</td>
                        <td>18/03/2023</td>
                        <td>Actif</td>
                        <td>€35.20</td>
                    </tr>
                </tbody>
            </table>
        </section>
        
        <section class="section">
            <h2 class="section-title"><i class="fas fa-history"></i> Historique des Gains</h2>
            <table class="referrals-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Montant</th>
                        <th>Statut</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>15/06/2023</td>
                        <td>Commission Jean Dupont</td>
                        <td>+€12.50</td>
                        <td>Crédité</td>
                    </tr>
                    <tr>
                        <td>10/06/2023</td>
                        <td>Commission Marie Martin</td>
                        <td>+€8.30</td>
                        <td>Crédité</td>
                    </tr>
                    <tr>
                        <td>05/06/2023</td>
                        <td>Bonus Niveau 10 filleuls</td>
                        <td>+€50.00</td>
                        <td>Crédité</td>
                    </tr>
                    <tr>
                        <td>28/05/2023</td>
                        <td>Commission Sophie Leroy</td>
                        <td>+€5.70</td>
                        <td>Crédité</td>
                    </tr>
                    <tr>
                        <td>15/05/2023</td>
                        <td>Retrait</td>
                        <td>-€100.00</td>
                        <td>Payé</td>
                    </tr>
                </tbody>
            </table>
        </section>
    </div>

    <script>
        function copyReferralLink() {
            const referralLink = document.getElementById('referralLink');
            referralLink.select();
            referralLink.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            const successMessage = document.getElementById('successMessage');
            successMessage.style.display = 'block';
            
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 3000);
        }
        
        // Social share links
        const referralUrl = encodeURIComponent('https://izyboost.com/ref/user123');
        const shareText = encodeURIComponent('Je viens de découvrir IzyBoost et je pense que ça pourrait t\'intéresser ! Inscris-toi avec mon lien pour bénéficier d\'un avantage exclusif.');
        
        document.querySelector('.facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${referralUrl}`;
        document.querySelector('.twitter').href = `https://twitter.com/intent/tweet?text=${shareText}&url=${referralUrl}`;
        document.querySelector('.whatsapp').href = `https://wa.me/?text=${shareText} ${referralUrl}`;
        document.querySelector('.linkedin').href = `https://www.linkedin.com/shareArticle?mini=true&url=${referralUrl}&title=Programme%20de%20Parrainage%20IzyBoost&summary=${shareText}`;
        document.querySelector('.email').href = `mailto:?subject=Découvre%20IzyBoost&body=${shareText} ${referralUrl}`;
    </script>
</body>
</html>