$(document).ready(function() {
    let currentTransaction = {
        id: null,
        gatewayReference: null,
        statusCheckInterval: null
    };
    
    // Gestion du formulaire de paiement
    $('#paymentForm').on('submit', function(e) {
        e.preventDefault();
        
        const amount = $('#amount').val();
        const phone = $('#phone').val();
        const userId = $('#user_id').val();
        
        if (!amount || !phone) {
            alert('Veuillez remplir tous les champs');
            return;
        }
        
        showLoading(true);
        
        // Initialisation du paiement
        $.ajax({
            url: 'payment.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'init_payment',
                amount: amount,
                phone: phone,
                user_id: userId
            },
            success: function(response) {
                if (response.success) {
                    currentTransaction.id = response.data.transaction_id;
                    currentTransaction.gatewayReference = response.data.gateway_reference;
                    
                    // Afficher les détails du paiement
                    $('#gatewayRef').text(response.data.gateway_reference);
                    $('#paymentAmount').text(amount + ' XAF');
                    updatePaymentStatus(response.data.status);
                    $('#paymentStatus').show();
                    
                    // Commencer à vérifier le statut
                    startStatusChecking();
                } else {
                    alert('Erreur: ' + response.message);
                    showLoading(false);
                }
            },
            error: function(xhr, status, error) {
                alert('Erreur lors de l\'initialisation du paiement: ' + error);
                showLoading(false);
            }
        });
    });
    
    // Fonction pour commencer à vérifier le statut
    function startStatusChecking() {
        // Vérifier immédiatement
        checkPaymentStatus();
        
        // Puis vérifier toutes les 5 secondes
        currentTransaction.statusCheckInterval = setInterval(checkPaymentStatus, 5000);
    }
    
    // Fonction pour vérifier le statut du paiement
    function checkPaymentStatus() {
        if (!currentTransaction.gatewayReference) return;
        
        $.ajax({
            url: 'payment.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'check_status',
                gateway_reference: currentTransaction.gatewayReference,
                transaction_id: currentTransaction.id
            },
            success: function(response) {
                if (response.success) {
                    updatePaymentStatus(response.data.status);
                    
                    // Si le paiement est terminé (succès ou échec), arrêter la vérification
                    if (response.data.status === 'SUCCESS' || response.data.status === 'FAILED') {
                        clearInterval(currentTransaction.statusCheckInterval);
                        showLoading(false);
                        
                        // Afficher les détails supplémentaires
                        let details = '<div class="alert ' + 
                            (response.data.status === 'SUCCESS' ? 'alert-success' : 'alert-danger') + '">';
                        details += response.data.status === 'SUCCESS' ? 
                            'Paiement réussi! Merci pour votre transaction.' : 
                            'Le paiement a échoué. Veuillez réessayer.';
                        details += '<br>Méthode: ' + (response.data.payment_method || 'Non spécifiée');
                        details += '</div>';
                        
                        $('#paymentDetails').html(details);
                    }
                }
            },
            error: function(xhr, status, error) {
                console.error('Erreur lors de la vérification du statut: ' + error);
            }
        });
    }
    
    // Fonction pour mettre à jour l'affichage du statut
    function updatePaymentStatus(status) {
        const statusElement = $('#paymentState');
        statusElement.removeClass('status-pending status-progress status-success status-failed');
        
        let statusText = '';
        let statusClass = '';
        
        switch(status) {
            case 'PENDING':
                statusText = 'En attente';
                statusClass = 'status-pending';
                break;
            case 'PAYMENT_IN_PROGRESS':
                statusText = 'Paiement en cours';
                statusClass = 'status-progress';
                break;
            case 'SUCCESS':
                statusText = 'Succès';
                statusClass = 'status-success';
                break;
            case 'FAILED':
                statusText = 'Échec';
                statusClass = 'status-failed';
                break;
            default:
                statusText = 'Inconnu';
        }
        
        statusElement.text(statusText).addClass(statusClass);
    }
    
    // Fonction pour afficher/masquer l'écran de chargement
    function showLoading(show) {
        if (show) {
            $('#loadingOverlay').show();
            $('body').css('overflow', 'hidden');
        } else {
            $('#loadingOverlay').hide();
            $('body').css('overflow', 'auto');
        }
    }
});