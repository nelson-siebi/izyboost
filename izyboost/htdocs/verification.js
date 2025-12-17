class TransactionVerifier {
    constructor() {
        this.eventSource = null;
        this.isVerifying = false;
    }

    startVerification() {
        if (this.isVerifying) {
            console.log('Vérification déjà en cours');
            return;
        }

        this.isVerifying = true;
        const button = document.getElementById('verify-transactions-btn');
        const statusDiv = document.getElementById('verification-status');
        
        // Réinitialiser l'interface
        button.innerHTML = '<span class="loader"></span> Vérification en cours...';
        button.disabled = true;
        statusDiv.innerHTML = '';
        statusDiv.style.display = 'block';

        console.log('Démarrage de la vérification...');

        // Créer la connexion SSE
        this.eventSource = new EventSource('b.php?action=verify_transactions&t=' + Date.now());

        this.eventSource.onopen = () => {
            console.log('Connexion SSE établie');
        };

        this.eventSource.onmessage = (event) => {
            console.log('Message reçu:', event.data);
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data, statusDiv);
            } catch (e) {
                console.error('Erreur parsing JSON:', e);
            }
        };

        this.eventSource.addEventListener('complete', (event) => {
            console.log('Événement complete reçu');
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data, statusDiv);
            } catch (e) {
                console.error('Erreur parsing complete:', e);
            }
            this.stopVerification();
            this.resetButton();
        });

        this.eventSource.onerror = (error) => {
            console.error('Erreur SSE:', error);
            this.stopVerification();
            
            // Afficher un message d'erreur
            this.handleMessage({
                status: 'error',
                message: 'Connexion interrompue'
            }, statusDiv);
            
            this.resetButton();
        };
    }

    handleMessage(data, statusDiv) {
        const message = document.createElement('div');
        message.className = `verification-message ${data.status}`;
        
        const timestamp = new Date().toLocaleTimeString();
        message.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="text">${data.message}</span>
            ${data.data ? `<div class="details">${JSON.stringify(data.data)}</div>` : ''}
        `;
        
        statusDiv.appendChild(message);
        message.scrollIntoView({ behavior: 'smooth' });

        // Mettre à jour le solde si fourni
        if (data.data && data.data.nouveau_solde !== undefined) {
            this.updateSoldeDisplay(data.data.nouveau_solde);
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

    resetButton() {
        const button = document.getElementById('verify-transactions-btn');
        button.innerHTML = 'Vérifier mes transactions';
        button.disabled = false;
    }

    updateSoldeDisplay(nouveauSolde) {
        const soldeElement = document.querySelector('.solde-display, [data-solde]');
        if (soldeElement) {
            soldeElement.textContent = nouveauSolde + ' FCFA';
            soldeElement.classList.add('solde-updated');
            setTimeout(() => {
                soldeElement.classList.remove('solde-updated');
            }, 2000);
        }
    }
}

// Initialisation globale
const verifier = new TransactionVerifier();

// Rendre disponible globalement pour le débogage
window.verifier = verifier;

// Ajouter le bouton à la page
function initVerificationButton() {
    if (!document.getElementById('verify-transactions-btn')) {
        const button = document.createElement('button');
        button.id = 'verify-transactions-btn';
        button.className = 'verify-btn';
        button.innerHTML = ' Vérifier mes transactions';
        button.onclick = () => verifier.startVerification();

        const statusDiv = document.createElement('div');
        statusDiv.id = 'verification-status';
        statusDiv.className = 'verification-status';

        // Insérer dans la page
        const container = document.querySelector('.user-actions, .dashboard-header, header') || document.body;
        container.appendChild(button);
        container.appendChild(statusDiv);
        
        console.log('Bouton de vérification initialisé');
    }
}

// Démarrer au chargement
document.addEventListener('DOMContentLoaded', initVerificationButton);
