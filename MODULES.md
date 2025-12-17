# Architecture Modulaire SaaS - IzyBoost

Ce document décrit l'architecture modulaire de la plateforme SaaS IzyBoost. Le système est divisé en **6 modules autonomes**.

## 1. User & Authentication Module

**Responsabilité :** Gestion des identités, sécurité et rôles.

- **Fonctionnalités :**
  - Inscription, Connexion (Email/Google).
  - Double authentification (2FA).
  - Gestion des rôles (Super Admin, Admin, Utilisateur, Revendeur).
  - Gestion des Clés API.
- **Tables Clés :** `users`, `api_keys`, `password_reset_tokens`.

## 2. Service Management Module

**Responsabilité :** Importation, synchronisation et tarification des services.

- **Source de Données :** Importation API externe (ex: `response_api.json`).
- **Fonctionnalités :**
  - Importer des services depuis les fournisseurs API.
  - Synchronisation automatique des prix et statuts.
  - **Règles de Prix :** Marge globale (ex: +30%) ou surcharges individuelles.
  - Gestion des Catégories.
- **Tables Clés :** `services`, `categories`, `api_providers`, `service_prices_override`.

## 3. Order Processing Module

**Responsabilité :** Gestion du cycle de vie d'une commande.

- **Fonctionnalités :**
  - Prise de commande via Web ou API.
  - Validation du solde utilisateur.
  - Envoi de la commande au Fournisseur Externe.
  - Jobs d'arrière-plan pour vérifier le statut (Pending -> Processing -> Completed).
  - Gestion automatique des Remboursements partiels/complets.
- **Tables Clés :** `orders`, `provider_logs`, `api_logs`.

## 4. Wallet & Finance Module

**Responsabilité :** Gestion financière.

- **Fonctionnalités :**
  - Dépôts (Crypto, Stripe, Mobile Money).
  - Historique des transactions (Entrées/Sorties).
  - Système de facturation.
  - Distribution des commissions de parrainage.
- **Tables Clés :** `transactions`, `payment_methods`, `invoices`, `referral_relationships`.

## 5. White Label / Reseller Module (Cœur du SaaS)

**Responsabilité :** Déploiement et gestion des sites enfants.

- **Fonctionnalités :**
  - Création de nouveaux "Panels Enfants" pour les revendeurs.
  - Gestion des domaines (domaines personnalisés).
  - Facturation des abonnements au panel (Mensuel/Annuel).
  - Sélecteur de Thème/Template.
- **Tables Clés :** `white_label_sites`, `white_label_plans`, `subscriptions`.

## 6. Support & Notification Module

**Responsabilité :** Service client.

- **Fonctionnalités :**
  - Système de Tickets.
  - Annonces internes.
  - Notifications Email.
- **Tables Clés :** `tickets`, `ticket_messages`, `notifications`.
