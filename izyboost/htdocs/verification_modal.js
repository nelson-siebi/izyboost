class TransactionVerifierModal {
    constructor() {
        this.eventSource = null;
        this.isVerifying = false;
        this.isModalVisible = false;
        this.totalTransactions = 0;
        this.processedTransactions = 0;
        
        this.init();
    }

    init() {
        this.createModal();
        this.addStyles();
    }

    createModal() {
        // Créer l'overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'verification-overlay';
        this.overlay.innerHTML = `
            <div class="verification-modal">
                <div class="modal-header">
                    <h3 class="modal-title">Vérification des transactions</h3>
                    <button class="modal-close" aria-label="Fermer">×</button>
                </div>
                <div class="modal-body">
                    <div class="verification-messages" id="verification-messages">
                        <div class="verification-message progress">
                            <span class="message-icon">⏳</span>
                            <div class="message-content">
                                <p class="message-text">Préparation de la vérification...</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="progress-indicator">
                        <span class="progress-text">Progression: 0%</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // Gestionnaires d'événements
        this.overlay.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hideModal();
            }
        });
    }

    addStyles() {
        // Les styles sont dans le CSS séparé
    }

    showModal() {
        this.isModalVisible = true;
        this.overlay.style.display = 'flex';
        document.body.classList.add('no-scroll');
        
        // Réinitialiser les messages
        this.clearMessages();
        this.updateProgress(0, 0);
        
        // Message initial
        this.addMessage('progress', '🚀 Démarrage de la vérification...');
    }

    hideModal() {
        this.isModalVisible = false;
        this.overlay.style.display = 'none';
        document.body.classList.remove('no-scroll');
        
        // Si la vérification est en cours, on la laisse continuer en arrière-plan
        if (this.isVerifying) {
            this.addMessage('info', 'Vérification continuée en arrière-plan...', null, true);
        }
    }

    startVerification() {
        if (this.isVerifying) {
            return;
        }

        this.isVerifying = true;
        this.showModal();

        console.log('Démarrage de la vérification...');

        // Créer la connexion SSE
        this.eventSource = new EventSource('b.php?action=verify_transactions&t=' + Date.now());

        this.eventSource.onopen = () => {
            console.log('Connexion SSE établie');
            this.addMessage('progress', '✅ Connexion établie');
        };

        this.eventSource.onmessage = (event) => {
            console.log('Message reçu:', event.data);
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.error('Erreur parsing JSON:', e);
            }
        };

        this.eventSource.addEventListener('complete', (event) => {
            console.log('Événement complete reçu');
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (e) {
                console.error('Erreur parsing complete:', e);
            }
            
            setTimeout(() => {
                this.stopVerification();
                this.addMessage('complete', '✅ Vérification terminée avec succès!');
                
                // Auto-fermeture après 3 secondes
                setTimeout(() => {
                    if (this.isModalVisible) {
                        this.hideModal();
                    }
                }, 3000);
            }, 1000);
        });

        this.eventSource.onerror = (error) => {
            console.error('Erreur SSE:', error);
            if (!this.isModalVisible) {
                // Si la modale est fermée, on ne fait rien
                return;
            }
            
            this.addMessage('error', '❌ Connexion interrompue');
            this.stopVerification();
        };
    }

    handleMessage(data) {
        if (!this.isModalVisible && data.status !== 'complete') {
            // Si la modale est fermée, on n'affiche pas les messages (sauf le final)
            return;
        }

        const iconMap = {
            'progress': '🔄',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'complete': '🎉'
        };

        this.addMessage(data.status, data.message, data.data, false, iconMap[data.status] || '📝');

        // Mettre à jour la progression
        if (data.data && data.data.progression) {
            const [current, total] = data.data.progression.split('/').map(Number);
            this.updateProgress(current, total);
        }

        // Mettre à jour le solde si fourni
        if (data.data && data.data.nouveau_solde !== undefined) {
            this.updateSoldeDisplay(data.data.nouveau_solde);
        }
    }

    addMessage(status, text, data = null, isBackground = false, customIcon = null) {
        if (isBackground && !this.isModalVisible) {
            return; // Ne pas ajouter de message si en arrière-plan et modale fermée
        }

        const messagesContainer = document.getElementById('verification-messages');
        const message = document.createElement('div');
        message.className = `verification-message ${status} ${isBackground ? 'background-message' : ''}`;
        
        const timestamp = new Date().toLocaleTimeString();
        const icon = customIcon || this.getStatusIcon(status);
        
        let detailsHtml = '';
        if (data) {
            const details = Object.entries(data)
                .map(([key, value]) => `<div><strong>${key}:</strong> ${JSON.stringify(value)}</div>`)
                .join('');
            detailsHtml = `<div class="message-details">${details}</div>`;
        }

        message.innerHTML = `
            <span class="message-icon">${icon}</span>
            <div class="message-content">
                <p class="message-text">${text}</p>
                <div class="message-timestamp">${timestamp}</div>
                ${detailsHtml}
            </div>
        `;
        
        messagesContainer.appendChild(message);
        message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    getStatusIcon(status) {
        const icons = {
            'progress': '🔄',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'complete': '🎉'
        };
        return icons[status] || '📝';
    }

    updateProgress(current, total) {
        if (total > 0) {
            const percentage = Math.round((current / total) * 100);
            const progressFill = this.overlay.querySelector('.progress-fill');
            const progressText = this.overlay.querySelector('.progress-text');
            
            if (progressFill) {
                progressFill.style.width = percentage + '%';
            }
            if (progressText) {
                progressText.textContent = `Progression: ${percentage}%`;
            }
        }
    }

    clearMessages() {
        const messagesContainer = document.getElementById('verification-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    }

    stopVerification() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.isVerifying = false;
        console.log('Vérification arrêtée');
    }

    updateSoldeDisplay(nouveauSolde) {
        // Mettre à jour l'affichage du solde sur la page principale
        const soldeElement = document.querySelector('.solde-display, [data-solde], .user-solde');
        if (soldeElement) {
            const ancienSolde = parseInt(soldeElement.textContent) || 0;
            soldeElement.textContent = nouveauSolde + ' FCFA';
            soldeElement.classList.add('solde-updated');
            
            // Animation de comptage
            this.animateCount(soldeElement, ancienSolde, nouveauSolde, 1000);
            
            setTimeout(() => {
                soldeElement.classList.remove('solde-updated');
            }, 2000);
        }
    }

    animateCount(element, start, end, duration) {
        const range = end - start;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(start + (range * easeOutQuart));
            
            element.textContent = currentValue + ' FCFA';
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        
        requestAnimationFrame(updateCount);
    }
}

// Initialisation globale
const verificationModal = new TransactionVerifierModal();

// Fonction pour ajouter le bouton à la page
function initVerificationButton() {
    if (!document.getElementById('verify-transactions-btn')) {
        const button = document.createElement('button');
        button.id = 'verify-transactions-btn';
        button.className = 'verify-btn';
        button.innerHTML = ' actualiser le solde';
        button.onclick = () => verificationModal.startVerification();

        // Styles de base pour le bouton
        button.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = 'none';
        });

        // Insérer dans la page
        const container = document.querySelector('.user-actions, .dashboard-header, header, .navbar') || document.body;
        container.appendChild(button);
        
        console.log('Bouton de vérification initialisé');
    }
}

// Rendre disponible globalement pour le débogage
window.verificationModal = verificationModal;

// Démarrer au chargement
document.addEventListener('DOMContentLoaded', initVerificationButton);

// Empêcher le scroll quand la modale est ouverte
document.addEventListener('wheel', (e) => {
    if (document.body.classList.contains('no-scroll')) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (document.body.classList.contains('no-scroll')) {
        e.preventDefault();
    }
}, { passive: false });