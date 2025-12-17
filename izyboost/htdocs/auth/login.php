<?php
session_start(); 

if (isset($_SESSION['user_id'])) {
    header('Location: ../accueil.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion</title>
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
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s forwards;
        }

        .input-group:nth-child(1) { animation-delay: 0.2s; }
        .input-group:nth-child(2) { animation-delay: 0.3s; }

        .input-wrapper {
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

        .input-icon {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--gray);
            transition: var(--transition);
            pointer-events: none;
        }

        input:focus + .input-icon {
            color: var(--primary);
            transform: translateY(-50%) scale(1.1);
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

        .remember-me {
            display: flex;
            align-items: center;
            margin: 20px 0;
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s forwards;
            animation-delay: 0.4s;
        }

        .remember-me input {
            width: auto;
            margin-right: 10px;
            accent-color: var(--primary);
        }

        .remember-me label {
            margin-bottom: 0;
            cursor: pointer;
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
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s forwards;
            animation-delay: 0.5s;
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
            opacity: 0;
            transform: translateY(20px);
            animation: fadeInUp 0.5s forwards;
            animation-delay: 0.6s;
        }

        .links a {
            color: var(--primary);
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: var(--transition);
            display: inline-block;
            position: relative;
            margin: 0 10px;
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
            
            .links a {
                display: block;
                margin: 10px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="form-container">
            <h1>Bienvenue à nouveau</h1>
            <form id="loginForm">
                <div class="input-group">
                    <label for="email">Email</label>
                    <div class="input-wrapper">
                        <input type="email" id="email" name="email" required>
                        <i class="fas fa-envelope input-icon"></i>
                    </div>
                    <div class="error-message" id="email-error"></div>
                </div>
                
                <div class="input-group">
                    <label for="password">Mot de passe</label>
                    <div class="input-wrapper">
                        <input type="password" id="password" name="password" required>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <div class="error-message" id="password-error"></div>
                </div>
                
                <div class="remember-me">
                    <input type="checkbox" id="remember" name="remember">
                    <label for="remember">Se souvenir de moi</label>
                </div>
                
                <button type="submit" id="submitBtn">
                    <span id="btnText">Se connecter</span>
                    <div id="loader" class="loader"></div>
                </button>
            </form>
            
            <div class="links">
                <a href="register.php"><i class="fas fa-user-plus"></i> Créer un compte</a>
                <a href="#"><i class="fas fa-key"></i> Mot de passe oublié ?</a>
            </div>
        </div>
        
        <div class="notification" id="notification">
            <i class="fas fa-check-circle"></i>
            <span id="notification-message"></span>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('loginForm');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const loader = document.getElementById('loader');
            const notification = document.getElementById('notification');
            const notificationMessage = document.getElementById('notification-message');

            // Validation en temps réel
            emailInput.addEventListener('input', validateEmail);
            passwordInput.addEventListener('input', validatePassword);

            function validateEmail() {
                const email = emailInput.value.trim();
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

            function validatePassword() {
                const password = passwordInput.value.trim();
                const passwordError = document.getElementById('password-error');
                
                if (!password) {
                    passwordError.classList.remove('show');
                    return false;
                }
                
                if (password.length < 6) {
                    passwordError.textContent = 'Minimum 6 caractères';
                    passwordError.classList.add('show');
                    return false;
                }
                
                passwordError.classList.remove('show');
                return true;
            }

            // Soumission du formulaire
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const isEmailValid = validateEmail();
                const isPasswordValid = validatePassword();
                
                if (!isEmailValid || !isPasswordValid) {
                    showNotification('Veuillez corriger les erreurs', 'error');
                    return;
                }
                
                // Afficher le loader
                btnText.style.visibility = 'hidden';
                loader.style.display = 'block';
                submitBtn.disabled = true;
                
                try {
                    const response = await fetch('login_user.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email: emailInput.value.trim(),
                            password: passwordInput.value.trim(),
                            remember: document.getElementById('remember').checked
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        showNotification('Connexion réussie !');
                        setTimeout(() => {
                            window.location.href = '../accueil.php';
                        }, 1000);
                    } else {
                        showNotification(data.message || 'Erreur de connexion', 'error');
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
                }, 1000);
            }
        });
    </script>
</body>
</html>