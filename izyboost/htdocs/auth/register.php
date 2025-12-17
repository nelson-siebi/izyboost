<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inscription</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        :root {
            --primary: #6c5ce7;
            --primary-light: #a29bfe;
            --secondary: #00cec9;
            --error: #ff7675;
            --success: #00b894;
            --warning: #fdcb6e;
            --dark: #2d3436;
            --light: #f5f6fa;
            --gray: #dfe6e9;
            --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            --shadow-hover: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 480px;
            perspective: 1000px;
        }

        .form-container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: var(--shadow);
            transform-style: preserve-3d;
            animation: fadeInUp 0.8s both;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
        }

        .form-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            animation: progressBar 2s ease-in-out infinite;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px) rotateX(10deg);
            }
            to {
                opacity: 1;
                transform: translateY(0) rotateX(0);
            }
        }

        @keyframes progressBar {
            0% { width: 0; }
            50% { width: 100%; }
            100% { width: 0; left: 100%; }
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
            color: var(--dark);
            font-weight: 700;
            font-size: 28px;
            position: relative;
            padding-bottom: 10px;
        }

        h1::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: var(--primary);
            border-radius: 3px;
        }

        .input-group {
            margin-bottom: 25px;
            position: relative;
        }

        label {
            display: block;
            margin-bottom: 8px;
            color: var(--dark);
            font-weight: 500;
            font-size: 14px;
            transition: var(--transition);
        }

        .input-wrapper {
            position: relative;
        }

        input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid var(--gray);
            border-radius: 8px;
            font-size: 16px;
            transition: var(--transition);
            background-color: rgba(245, 246, 250, 0.5);
        }

        input:focus {
            border-color: var(--primary-light);
            box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.1);
            outline: none;
            background-color: white;
        }

        input:focus + .input-icon {
            color: var(--primary);
            transform: translateY(-50%) scale(1.1);
        }

        .input-icon {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray);
            transition: var(--transition);
            pointer-events: none;
        }

        .error-message {
            color: var(--error);
            font-size: 13px;
            margin-top: 5px;
            height: 18px;
            opacity: 0;
            transform: translateY(-5px);
            transition: var(--transition);
        }

        .error-message.show {
            opacity: 1;
            transform: translateY(0);
        }

        .password-strength {
            margin-top: 15px;
            height: 6px;
            background: var(--gray);
            border-radius: 3px;
            overflow: hidden;
            position: relative;
        }

        .strength-bar {
            height: 100%;
            width: 0;
            transition: var(--transition);
            position: absolute;
            left: 0;
            top: 0;
        }

        .strength-text {
            font-size: 12px;
            margin-top: 5px;
            color: var(--dark);
            font-weight: 500;
            transition: var(--transition);
        }

        .weak {
            background: var(--error);
            width: 33%;
        }

        .medium {
            background: var(--warning);
            width: 66%;
        }

        .strong {
            background: var(--success);
            width: 100%;
        }

        button {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow);
            margin-top: 10px;
        }

        button:hover {
            box-shadow: var(--shadow-hover);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }

        button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: 0.5s;
        }

        button:hover::before {
            left: 100%;
        }

        #btnText {
            position: relative;
            z-index: 1;
            transition: var(--transition);
        }

        .loader {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 24px;
            height: 24px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            z-index: 1;
        }

        @keyframes spin {
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .links {
            margin-top: 25px;
            text-align: center;
        }

        .links a {
            color: var(--primary);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: var(--transition);
            display: inline-block;
            position: relative;
        }

        .links a:hover {
            color: var(--primary-light);
        }

        .links a::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary);
            transition: var(--transition);
        }

        .links a:hover::after {
            width: 100%;
        }

        .notification {
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 18px 25px;
            background: var(--success);
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-hover);
            transform: translateX(150%) scale(0.8);
            transition: var(--transition);
            opacity: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            max-width: 90%;
        }

        .notification.error {
            background: var(--error);
        }

        .notification.show {
            transform: translateX(0) scale(1);
            opacity: 1;
        }

        .notification i {
            margin-right: 10px;
            font-size: 20px;
        }

        /* Animation pour les champs */
        .input-group {
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s forwards;
        }

        .input-group:nth-child(1) { animation-delay: 0.1s; }
        .input-group:nth-child(2) { animation-delay: 0.2s; }
        .input-group:nth-child(3) { animation-delay: 0.3s; }
        .input-group:nth-child(4) { animation-delay: 0.4s; }
        .input-group:nth-child(5) { animation-delay: 0.5s; }

        /* Responsive */
        @media (max-width: 576px) {
            .form-container {
                padding: 30px 20px;
            }
            
            h1 {
                font-size: 24px;
                margin-bottom: 20px;
            }
            
            input {
                padding: 12px 15px;
            }
            
            button {
                padding: 14px;
            }
        }

        /* Floating label effect */
        .floating-label {
            position: relative;
        }

        .floating-label label {
            position: absolute;
            top: 15px;
            left: 20px;
            pointer-events: none;
            transition: var(--transition);
            background: white;
            padding: 0 5px;
        }

        .floating-label input:focus + label,
        .floating-label input:not(:placeholder-shown) + label {
            top: -10px;
            left: 15px;
            font-size: 12px;
            color: var(--primary);
            background: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="form-container">
            <h1>Créez votre compte</h1>
            <form id="registerForm">
                <div class="input-group floating-label">
                    <div class="input-wrapper">
                        <input type="text" id="nom" name="nom" required placeholder=" ">
                        <label for="nom">Nom complet</label>
                        <i class="fas fa-user input-icon"></i>
                    </div>
                    <div class="error-message" id="nom-error"></div>
                </div>
                
                <div class="input-group floating-label">
                    <div class="input-wrapper">
                        <input type="email" id="email" name="email" required placeholder=" ">
                        <label for="email">Email</label>
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                    <div class="error-message" id="email-error"></div>
                </div>
                
                <div class="input-group floating-label">
                    <div class="input-wrapper">
                        <input type="tel" id="numero" name="numero" required placeholder=" ">
                        <label for="numero">Numéro de téléphone</label>
                        <i class="fas fa-phone input-icon"></i>
                    </div>
                    <div class="error-message" id="numero-error"></div>
                </div>
                
                <div class="input-group floating-label">
                    <div class="input-wrapper">
                        <input type="password" id="password" name="password" required placeholder=" ">
                        <label for="password">Mot de passe</label>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <div class="error-message" id="password-error"></div>
                    <div class="password-strength">
                        <div class="strength-bar"></div>
                        <div class="strength-text"></div>
                    </div>
                </div>
                
                <div class="input-group floating-label">
                    <div class="input-wrapper">
                        <input type="password" id="confirmPassword" name="confirmPassword" required placeholder=" ">
                        <label for="confirmPassword">Confirmer le mot de passe</label>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <div class="error-message" id="confirmPassword-error"></div>
                </div>
                
                <button type="submit" id="submitBtn">
                    <span id="btnText">S'inscrire</span>
                    <div id="loader" class="loader"></div>
                </button>
            </form>
            
            <div class="links">
                <a href="login.php"><i class="fas fa-sign-in-alt"></i> Déjà un compte ? Se connecter</a>
            </div>
        </div>
        
        <div class="notification" id="notification">
            <i class="fas fa-check-circle"></i>
            <span id="notification-message"></span>
        </div>
    </div>
    
    <script>
        // Votre script JavaScript existant reste inchangé
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('registerForm');
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const loader = document.getElementById('loader');
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notification-message');
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');

            // Validation en temps réel
            document.getElementById('nom').addEventListener('input', validateNom);
            document.getElementById('email').addEventListener('input', validateEmail);
            document.getElementById('numero').addEventListener('input', validateNumero);
            document.getElementById('password').addEventListener('input', validatePassword);
            document.getElementById('confirmPassword').addEventListener('input', validateConfirmPassword);

            function validateNom() {
                const nom = document.getElementById('nom').value.trim();
                const nomError = document.getElementById('nom-error');
                
                if (!nom) {
                    nomError.classList.remove('show');
                    return false;
                }
                
                if (nom.length < 3) {
                    nomError.textContent = 'Minimum 3 caractères';
                    nomError.classList.add('show');
                    return false;
                }
                
                nomError.classList.remove('show');
                return true;
            }

            function validateEmail() {
                const email = document.getElementById('email').value.trim();
                const emailError = document.getElementById('email-error');
                
                if (!email) {
                    emailError.classList.remove('show');
                    return false;
                }
                
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    emailError.textContent = 'Email invalide';
                    emailError.classList.add('show');
                    return false;
                }
                
                emailError.classList.remove('show');
                return true;
            }

            function validateNumero() {
                const numero = document.getElementById('numero').value.trim();
                const numeroError = document.getElementById('numero-error');
                
                if (!numero) {
                    numeroError.classList.remove('show');
                    return false;
                }
                
                if (!/^[0-9]{9,15}$/.test(numero)) {
                    numeroError.textContent = 'Numéro invalide';
                    numeroError.classList.add('show');
                    return false;
                }
                
                numeroError.classList.remove('show');
                return true;
            }

            function validatePassword() {
                const password = document.getElementById('password').value;
                const passwordError = document.getElementById('password-error');
                
                if (!password) {
                    passwordError.classList.remove('show');
                    updatePasswordStrength('');
                    return false;
                }
                
                if (password.length < 6) {
                    passwordError.textContent = 'Minimum 6 caractères';
                    passwordError.classList.add('show');
                    updatePasswordStrength('weak');
                    return false;
                }
                
                passwordError.classList.remove('show');
                
                // Vérifier la force du mot de passe
                const strength = checkPasswordStrength(password);
                updatePasswordStrength(strength);
                
                return true;
            }

            function validateConfirmPassword() {
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const confirmError = document.getElementById('confirmPassword-error');
                
                if (!confirmPassword) {
                    confirmError.classList.remove('show');
                    return false;
                }
                
                if (password !== confirmPassword) {
                    confirmError.textContent = 'Les mots de passe ne correspondent pas';
                    confirmError.classList.add('show');
                    return false;
                }
                
                confirmError.classList.remove('show');
                return true;
            }

            function checkPasswordStrength(password) {
                // Vérification de la force du mot de passe
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasNumbers = /\d/.test(password);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                
                let strength = 0;
                
                if (password.length >= 8) strength++;
                if (hasUpperCase) strength++;
                if (hasLowerCase) strength++;
                if (hasNumbers) strength++;
                if (hasSpecial) strength++;
                
                if (strength < 3) return 'weak';
                if (strength < 5) return 'medium';
                return 'strong';
            }

            function updatePasswordStrength(strength) {
                strengthBar.className = 'strength-bar';
                
                switch (strength) {
                    case 'weak':
                        strengthBar.classList.add('weak');
                        strengthText.textContent = 'Faible';
                        strengthText.style.color = 'var(--error)';
                        break;
                    case 'medium':
                        strengthBar.classList.add('medium');
                        strengthText.textContent = 'Moyen';
                        strengthText.style.color = 'var(--warning)';
                        break;
                    case 'strong':
                        strengthBar.classList.add('strong');
                        strengthText.textContent = 'Fort';
                        strengthText.style.color = 'var(--success)';
                        break;
                    default:
                        strengthText.textContent = '';
                }
            }

            // Soumission du formulaire
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const isNomValid = validateNom();
                const isEmailValid = validateEmail();
                const isNumeroValid = validateNumero();
                const isPasswordValid = validatePassword();
                const isConfirmValid = validateConfirmPassword();
                
                if (!isNomValid || !isEmailValid || !isNumeroValid || !isPasswordValid || !isConfirmValid) {
                    showNotification('Veuillez corriger les erreurs', 'error');
                    return;
                }
                
                // Afficher le loader
                btnText.style.visibility = 'hidden';
                loader.style.display = 'block';
                submitBtn.disabled = true;
                
                try {
                    const response = await fetch('register_user.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nom: document.getElementById('nom').value.trim(),
                            email: document.getElementById('email').value.trim(),
                            numero: document.getElementById('numero').value.trim(),
                            password: document.getElementById('password').value
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        showNotification('Inscription réussie !');
                        setTimeout(() => {
                            window.location.href = 'login.php';
                        }, 1500);
                    } else {
                        showNotification(data.message || 'Erreur lors de l\'inscription', 'error');
                    }
                } catch (error) {
                    showNotification('Erreur réseau', 'error');
                    console.error('Error:', error);
                } finally {
                    // Cacher le loader
                    btnText.style.visibility = 'visible';
                    loader.style.display = 'none';
                    submitBtn.disabled = false;
                }
            });

            function showNotification(message, type = 'success') {
                notification.className = 'notification';
                notification.classList.add(type);
                notificationMessage.textContent = message;
                
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
        });
    </script>
</body>
</html>