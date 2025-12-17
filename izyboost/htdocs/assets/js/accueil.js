document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const boostForm = document.getElementById('boostForm');
    const serviceSelect = document.getElementById('serviceList');
    const quantityInput = document.getElementById('quantity');
    const urlInput = document.getElementById('url');
    const btnBoost = document.getElementById('btn-boost');
    const totalPriceElement = document.getElementById('totalPrice');
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    document.body.appendChild(messageContainer);

    // Variables d'état
    let services = [];
    let currentRate = 0;
    let currentServiceId = 0;
    let currentMinQty = 0;

    // Initialisation
    loadServices();
    setupEventListeners();
    disableForm();

    function setupEventListeners() {
        serviceSelect.addEventListener('change', handleServiceChange);
        quantityInput.addEventListener('input', updateTotalPrice);
        boostForm.addEventListener('submit', handleFormSubmit);
    }

    async function loadServices() {
        try {
            const response = await fetch('get_services.php');
            if (!response.ok) throw new Error('Erreur de chargement des services');
            
            services = await response.json();
            populateServiceDropdown();
        } catch (error) {
            showMessage(`Erreur: ${error.message}`, 'error');
            console.error('Erreur:', error);
        }
    }

    function populateServiceDropdown() {
        serviceSelect.innerHTML = '<option value="">Sélectionnez un service</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.service;
            option.textContent = service.name;
            option.dataset.rate = service.rate / 1000;
            option.dataset.min = service.min;
            option.dataset.max = service.max;
            
            serviceSelect.appendChild(option);
        });
    }

    function handleServiceChange() {
        const selectedOption = this.options[this.selectedIndex];
        
        if (!selectedOption.value) {
            disableForm();
            return;
        }

        // Mettre à jour les variables globales
        currentRate = parseFloat(selectedOption.dataset.rate);
        currentServiceId = selectedOption.value;
        currentMinQty = parseInt(selectedOption.dataset.min);

        // Mettre à jour l'affichage des informations
        document.getElementById('minQty').textContent = selectedOption.dataset.min;
        document.getElementById('maxQty').textContent = selectedOption.dataset.max;
        document.getElementById('unitPrice').textContent = currentRate.toFixed(4);

        // Définir la valeur par défaut (min) mais permettre la modification
        quantityInput.value = currentMinQty;

        updateTotalPrice();
        enableForm();
    }

    function enableForm() {
        quantityInput.disabled = false;
        urlInput.disabled = false;
        btnBoost.disabled = false;
    }

    function disableForm() {
        quantityInput.disabled = true;
        urlInput.disabled = true;
        btnBoost.disabled = true;
        quantityInput.value = '';
        urlInput.value = '';
        totalPriceElement.textContent = '0.00';
    }

    function updateTotalPrice() {
        const quantity = parseInt(quantityInput.value) || 0;
        const total = (currentRate * quantity).toFixed(2);
        totalPriceElement.textContent = total;
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) return;

        btnBoost.disabled = true;
        btnBoost.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';

        try {
            // Validation de la quantité avant envoi
            const enteredQty = parseInt(quantityInput.value) || 0;
            if (enteredQty < currentMinQty) {
                throw new Error(`La quantité minimale est ${currentMinQty}`);
            }

            const formData = new FormData();
            formData.append('service', currentServiceId);
            formData.append('link', urlInput.value.trim());
            formData.append('quantity', quantityInput.value);
            formData.append('rate', currentRate * 1000);

            const response = await fetch('place_order.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Erreur lors de la commande');
            }

            showMessage(`Commande #NEX-${result.order} réussie!`, 'success');
            resetForm();
        } catch (error) {
            console.error('Erreur:', error);
            showMessage(error.message, 'error');
        } finally {
            btnBoost.disabled = false;
            btnBoost.innerHTML = '<i class="fas fa-rocket"></i> Commander';
        }
    }

    function validateForm() {
        if (!serviceSelect.value) {
            showMessage('Veuillez sélectionner un service', 'error');
            return false;
        }

        if (!isValidUrl(urlInput.value)) {
            showMessage('Veuillez entrer une URL valide', 'error');
            return false;
        }

        return true;
    }

    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    function showMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        messageContainer.appendChild(messageElement);

        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => messageElement.remove(), 500);
        }, 5000);
    }

    function resetForm() {
        boostForm.reset();
        disableForm();
        serviceSelect.value = '';
    }
});

// CSS pour les messages
const style = document.createElement('style');
style.textContent = `
    .message-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    .message {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        opacity: 1;
        transition: opacity 0.5s;
    }
    .message.success {
        background-color: #4CAF50;
    }
    .message.error {
        background-color: #F44336;
    }
    .fade-out {
        opacity: 0;
    }
    .fa-spinner {
        margin-right: 8px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);