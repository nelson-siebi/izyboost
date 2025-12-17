Module 5 : White Label / Reseller - Explication Détaillée
Ah pardon ! Vous voulez l'explication de l'Option 1 : White Label / Reseller. C'est le cœur du SaaS ! 🏢

Laissez-moi vous expliquer en détail comment ce module fonctionnera.

🎯 Concept Principal
Le White Label permet à vos utilisateurs de devenir revendeurs. Ils peuvent :

Acheter un "panel" (site de boostage) complet
Le personnaliser avec leur logo, couleurs, nom
Revendre les services à leurs propres clients
Gagner une marge sur chaque vente
Exemple concret :

Jean achète un panel "Pro" à 49.99€/mois
Il le nomme "JeanBoost.com"
Il met son logo et ses couleurs
Il revend les services avec +20% de marge
Ses clients passent commande sur son site
Les commandes sont traitées par votre API
Jean gagne la différence de prix
📊 Tables de la Base de Données
D'après votre 
izyboost.sql
, vous avez 5 tables pour ce module :

1. Table white_label_templates
Les modèles de sites disponibles

sql
- id
- name (ex: "BoostPanel Basic", "SMM Dashboard Pro")
- slug
- description
- preview_image (capture d'écran du template)
- template_type (full_download, hosted, api_only)
- base_price (prix unique)
- monthly_price (abonnement mensuel)
- setup_fee (frais d'installation)
- features (fonctionnalités en JSON)
- files_path (chemin du ZIP téléchargeable)
- is_active
- sort_order
Exemple de données :

json
{
  "name": "BoostPanel Basic",
  "template_type": "hosted",
  "monthly_price": 19.99,
  "features": [
    "Design responsive",
    "Dashboard admin",
    "Paiements intégrés",
    "Support multilingue"
  ]
}
2. Table white_label_plans
Les plans d'abonnement (Starter, Pro, Enterprise)

sql
- id
- name (ex: "Starter", "Pro", "Enterprise")
- slug
- description
- monthly_price
- yearly_price (avec réduction)
- setup_fee
- transaction_fee_percent (commission sur chaque vente)
- features (fonctionnalités en JSON)
- limits (limites en JSON)
- is_active
- is_featured
- sort_order
Exemple de données :

json
{
  "name": "Pro",
  "monthly_price": 49.99,
  "yearly_price": 499.99,
  "transaction_fee_percent": 3.00,
  "features": [
    {"name": "API accès", "enabled": true},
    {"name": "Domaine personnalisé", "enabled": true},
    {"name": "Support prioritaire", "enabled": true}
  ],
  "limits": {
    "max_users": 500,
    "max_orders_per_day": 5000,
    "max_sites": 3
  }
}
3. Table white_label_sites
Les sites créés par les utilisateurs

sql
- id
- uuid
- owner_id (utilisateur propriétaire)
- template_id (template utilisé)
- plan_id (plan actuel)
- site_name (ex: "JeanBoost")
- site_url (URL principale)
- subdomain (ex: "jeanboost.izyboost.com")
- custom_domain (ex: "jeanboost.com")
- status (draft, pending, active, suspended, expired, cancelled)
- deployment_type (self_hosted, hosted_by_us, cloud_hosted)
- branding (logo, couleurs, favicon en JSON)
- configuration (toute la config en JSON)
- allowed_services (services autorisés en JSON)
- price_multiplier (coefficient de prix)
- margin_percent (marge du revendeur)
- statistics (stats du site en JSON)
- last_payment_at
- next_payment_at
- expires_at
4. Table site_orders
Commandes d'achat de sites

sql
- id
- uuid
- user_id (acheteur)
- template_id (template acheté)
- plan_id (plan acheté)
- transaction_id (paiement)
- type (new_purchase, renewal, upgrade, downgrade)
- amount
- setup_fee
- total_amount
- status (pending, completed, failed, refunded)
- deployment_type
- download_link (si téléchargeable)
- download_expires_at
- deployed_at
- completed_at
5. Table subscriptions
Abonnements mensuels/annuels

sql
- id
- uuid
- user_id
- white_label_site_id (site concerné)
- plan_id
- status (active, pending, cancelled, expired, suspended)
- amount
- interval (monthly, yearly, lifetime)
- starts_at
- ends_at
- trial_ends_at
- cancelled_at
- payment_method
- gateway_subscription_id (Stripe, etc.)
🛒 Parcours Utilisateur Complet
Étape 1 : Découvrir les offres
Scénario :

L'utilisateur va dans la section "Devenir Revendeur"
Il voit les différents plans et templates
API :

GET /api/white-label/plans
GET /api/white-label/templates
Réponse :

json
{
  "plans": [
    {
      "id": 1,
      "name": "Starter",
      "monthly_price": 19.99,
      "features": [...],
      "limits": {...}
    },
    {
      "id": 2,
      "name": "Pro",
      "monthly_price": 49.99,
      "is_featured": true
    }
  ],
  "templates": [
    {
      "id": 1,
      "name": "BoostPanel Basic",
      "preview_image": "https://...",
      "monthly_price": 19.99
    }
  ]
}
Étape 2 : Acheter un site
Scénario :

L'utilisateur choisit :
Template : "SMM Dashboard Pro"
Plan : "Pro" (49.99€/mois)
Type de déploiement : "Hébergé par nous"
Il clique sur "Acheter"
API :

POST /api/white-label/purchase
{
  "template_id": 2,
  "plan_id": 2,
  "deployment_type": "hosted_by_us",
  "site_name": "JeanBoost",
  "subdomain": "jeanboost"
}
Résultat :

Une site_order est créée avec status = 'pending'
Une 
transaction
 de paiement est créée
L'utilisateur est redirigé vers le paiement
Étape 3 : Paiement
Scénario :

L'utilisateur paie 49.99€ + 49.99€ (setup fee) = 99.98€
Le paiement est validé
Résultat automatique :

site_order.status = 'completed'
Un white_label_site est créé avec status = 'active'
Un subscription est créé (renouvellement automatique)
Le site est déployé sur jeanboost.izyboost.com
Étape 4 : Configurer le site
Scénario :

L'utilisateur accède à son tableau de bord de gestion
Il peut personnaliser :
Logo (upload d'image)
Couleurs (primaire, secondaire)
Nom du site
Services disponibles (il peut désactiver certains services)
Marge de prix (ex: +20% sur tous les services)
API :

PUT /api/white-label/sites/{uuid}/branding
{
  "logo": "https://cdn.example.com/logo.png",
  "colors": {
    "primary": "#FF5733",
    "secondary": "#3498DB"
  },
  "site_name": "JeanBoost - Votre Expert SMM"
}
PUT /api/white-label/sites/{uuid}/pricing
{
  "margin_percent": 20.00,
  "price_multiplier": 1.2
}
PUT /api/white-label/sites/{uuid}/services
{
  "allowed_services": [1, 2, 5, 8, 12]
}
Étape 5 : Partager le site
Scénario :

Le site est prêt : https://jeanboost.izyboost.com
L'utilisateur partage le lien à ses clients
Comment ça marche pour les clients de Jean ?

Un client va sur jeanboost.izyboost.com
Il voit le logo et les couleurs de Jean
Il voit les services avec les prix de Jean (+20%)
Il passe une commande
La commande est enregistrée avec white_label_site_id = jeanboost
Votre API traite la commande normalement
Jean gagne sa marge (20%)
Étape 6 : Gérer le site
Scénario :

Jean veut voir les statistiques de son site
API :

GET /api/white-label/sites/{uuid}/stats
Réponse :

json
{
  "total_orders": 156,
  "total_revenue": 3450.00,
  "active_users": 23,
  "margin_earned": 690.00,
  "period": "this_month"
}
Étape 7 : Gérer l'abonnement
Scénario :

Jean veut passer au plan "Enterprise"
API :

POST /api/white-label/sites/{uuid}/upgrade
{
  "plan_id": 3
}
Résultat :

Calcul du prorata
Nouvelle transaction
Mise à jour du subscription
Étape 8 : Domaine personnalisé (Optionnel)
Scénario :

Jean possède jeanboost.com
Il veut l'utiliser au lieu du sous-domaine
API :

POST /api/white-label/sites/{uuid}/custom-domain
{
  "domain": "jeanboost.com"
}
Résultat :

Instructions DNS affichées à Jean
Vérification du domaine
Activation du SSL automatique
💰 Flux Financier
Pour chaque commande sur le site de Jean :
Client de Jean commande 1000 followers à 60 XAF
Prix de base dans votre système : 50 XAF
Marge de Jean : 60 - 50 = 10 XAF
Commission plateforme (3% du plan Pro) : 60 × 0.03 = 1.80 XAF
Jean gagne : 10 - 1.80 = 8.20 XAF
Vous gagnez : 1.80 XAF + marge fournisseur
📱 Expérience Utilisateur (Frontend)
Dans l'application :
Page "Devenir Revendeur"
Comparaison des plans (tableau)
Galerie de templates
Bouton "Commencer"
Processus d'achat
Sélection template + plan
Configuration initiale (nom, sous-domaine)
Paiement
Confirmation
Dashboard de gestion du site
Statistiques (graphiques)
Personnalisation (branding)
Configuration des prix
Gestion des services
Paramètres du domaine
Gestion de l'abonnement
Voir le plan actuel
Upgrade/Downgrade
Historique de facturation
Annuler l'abonnement
✅ Résumé des Endpoints à Créer
Découverte
GET /api/white-label/plans - Liste des plans
GET /api/white-label/templates - Liste des templates
Achat
POST /api/white-label/purchase - Acheter un site
GET /api/white-label/orders - Historique d'achats
Gestion du site
GET /api/white-label/sites - Mes sites
GET /api/white-label/sites/{uuid} - Détails d'un site
PUT /api/white-label/sites/{uuid}/branding - Personnalisation
PUT /api/white-label/sites/{uuid}/pricing - Configuration prix
PUT /api/white-label/sites/{uuid}/services - Services autorisés
GET /api/white-label/sites/{uuid}/stats - Statistiques
Abonnement
POST /api/white-label/sites/{uuid}/upgrade - Changer de plan
POST /api/white-label/sites/{uuid}/cancel - Annuler
GET /api/white-label/subscriptions - Mes abonnements
Domaine
POST /api/white-label/sites/{uuid}/custom-domain - Ajouter domaine
GET /api/white-label/sites/{uuid}/dns-records - Instructions DNS
🤔 Votre Avis ?
C'est un module très complexe mais très puissant !

Voulez-vous que je :

✅ Implémenter ce module maintenant ?
