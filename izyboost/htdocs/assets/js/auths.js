document.addEventListener('DOMContentLoaded', function() {
    // Toggle sidebar on mobile
    const sidebarToggle = document.createElement('div');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.top-nav').prepend(sidebarToggle);
    
    sidebarToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.sidebar');
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnToggle = e.target === sidebarToggle || sidebarToggle.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnToggle && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    // User dropdown
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <a href="#"><i class="fas fa-user"></i> Mon Profil</a>
            <a href="#"><i class="fas fa-cog"></i> Paramètres</a>
            <a href="#"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
        `;
        userInfo.appendChild(dropdown);
        
        userInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('show');
        });
    }
    
    // Notification dropdown
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <h4>Notifications</h4>
                <a href="#">Marquer comme lues</a>
            </div>
            <div class="notification-list">
                <a href="#" class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <div class="notification-content">
                        <p>Votre commande #IZB-78945 a été complétée</p>
                        <span>Il y a 2 heures</span>
                    </div>
                </a>
                <a href="#" class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-wallet"></i>
                    </div>
                    <div class="notification-content">
                        <p>Votre compte a été rechargé de 10,000 FCFA</p>
                        <span>Il y a 1 jour</span>
                    </div>
                </a>
                <a href="#" class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="notification-content">
                        <p>Promotion spéciale: 20% de réduction sur les abonnés Instagram</p>
                        <span>Il y a 2 jours</span>
                    </div>
                </a>
            </div>
            <div class="dropdown-footer">
                <a href="#">Voir toutes les notifications</a>
            </div>
        `;
        notifications.appendChild(dropdown);
        
        notifications.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
            document.querySelector('.notification-count').style.display = 'none';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdown.classList.remove('show');
        });
    }
    
    // Boost service buttons
    const boostButtons = document.querySelectorAll('.btn-action');
    boostButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Vous serez redirigé vers la page de boost pour ce service. Cette fonctionnalité sera implémentée dans la version finale.');
        });
    });
    
    // Recharge button
    const rechargeBtn = document.querySelector('.btn-recharge');
    if (rechargeBtn) {
        rechargeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Vous serez redirigé vers la page de recharge de compte. Cette fonctionnalité sera implémentée dans la version finale.');
        });
    }
    
    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // In a real app, this would make an AJAX call to logout.php
            alert('Vous avez été déconnecté. Redirection vers la page d\'accueil.');
            window.location.href = '../index.html';
        });
    }
});