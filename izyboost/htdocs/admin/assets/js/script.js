document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets
    const menuItems = document.querySelectorAll('.menu li[data-tab]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Retirer la classe active de tous les éléments
            menuItems.forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            
            // Ajouter la classe active à l'élément cliqué
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Timer d'activité
    let seconds = 0;
    const activityTimer = document.getElementById('activity-timer');
    
    setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        activityTimer.textContent = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }, 1000);
    
    // Recherche dans les tables
    const searchInputs = {
        'search-commandes': 'commandes-tab table',
        'search-users': 'users-tab table',
        'search-vraies-commandes': 'vraies-commandes-tab table'
    };
    
    for (const [inputId, tableSelector] of Object.entries(searchInputs)) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                const table = document.querySelector(`#${tableSelector}`);
                const rows = table.querySelectorAll('tbody tr');
                const searchTerm = this.value.toLowerCase();
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }
    
    // Filtre par statut
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
        filterStatus.addEventListener('change', function() {
            const status = this.value;
            const rows = document.querySelectorAll('#commandes-tab table tbody tr');
            
            rows.forEach(row => {
                if (status === 'all') {
                    row.style.display = '';
                } else {
                    const rowStatus = row.getAttribute('data-status');
                    row.style.display = rowStatus === status ? '' : 'none';
                }
            });
        });
    }
    
    const filterVraiesStatus = document.getElementById('filter-vraies-status');
    if (filterVraiesStatus) {
        filterVraiesStatus.addEventListener('change', function() {
            const status = this.value;
            const rows = document.querySelectorAll('#vraies-commandes-tab table tbody tr');
            
            rows.forEach(row => {
                if (status === 'all') {
                    row.style.display = '';
                } else {
                    const rowStatus = row.getAttribute('data-status');
                    row.style.display = rowStatus === status ? '' : 'none';
                }
            });
        });
    }
    
    // Modals
    const modals = {
        view: document.getElementById('view-modal'),
        edit: document.getElementById('edit-modal')
    };
    
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Boutons Voir
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const table = this.closest('.tab-content').id.replace('-tab', '');
            
            fetch('get_details.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${id}&table=${table}`
            })
            .then(response => response.text())
            .then(data => {
                document.getElementById('modal-body-content').innerHTML = data;
                modals.view.classList.add('active');
            })
            .catch(error => console.error('Error:', error));
        });
    });
    
    // Boutons Modifier
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const table = this.closest('.tab-content').id.replace('-tab', '');
            const status = this.closest('tr').querySelector('.status-badge').textContent.trim();
            
            document.getElementById('edit-id').value = id;
            document.getElementById('edit-table').value = table;
            document.getElementById('edit-statut').value = status.toLowerCase();
            
            modals.edit.classList.add('active');
        });
    });
    
    // Formulaire d'édition
    const editForm = document.getElementById('edit-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = document.getElementById('edit-id').value;
            const table = document.getElementById('edit-table').value;
            const statut = document.getElementById('edit-statut').value;
            
            fetch('update_status.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${id}&table=${table}&statut=${statut}`
            })
            .then(response => response.text())
            .then(data => {
                if (data === 'success') {
                    alert('Statut mis à jour avec succès!');
                    location.reload();
                } else {
                    alert('Erreur lors de la mise à jour: ' + data);
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }
    
    // Fermer les modals en cliquant à l'extérieur
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
});