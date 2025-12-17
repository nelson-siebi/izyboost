-- ============================================
-- PLATEFORME SMM COMPLÈTE - VERSION SIMPLIFIÉE
-- Tous utilisateurs ont mêmes permissions sauf admin
-- ============================================

-- Désactiver les contraintes temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. TABLES UTILISATEURS & PARRAINAGE
-- ============================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID unique',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nom d’utilisateur',
    `email` VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email',
    `email_verified_at` TIMESTAMP NULL DEFAULT NULL,
    `password` VARCHAR(255) NOT NULL,
    `google_id` VARCHAR(255) DEFAULT NULL COMMENT 'Pour auth Google',
    `google_token` TEXT DEFAULT NULL COMMENT 'Token Google chiffré',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT 'Photo profil',
    `role` ENUM('super_admin', 'admin', 'user') NOT NULL DEFAULT 'user' COMMENT 'Rôle simplifié',
    
    -- Finances
    `balance` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Solde principal',
    `api_balance` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Solde API',
    `earnings` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Gains parrainage',
    `withdrawable` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Retirable',
    
    -- Paramètres
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `language` VARCHAR(10) NOT NULL DEFAULT 'fr',
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Europe/Paris',
    
    -- Parrainage
    `sponsor_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'ID parrain',
    `sponsor_code` VARCHAR(20) UNIQUE DEFAULT NULL COMMENT 'Code parrainage',
    `commission_rate` DECIMAL(5, 2) NOT NULL DEFAULT 10.00 COMMENT 'Commission %',
    
    -- Limites
    `api_limit_per_minute` INT NOT NULL DEFAULT 100 COMMENT 'Requêtes API/minute',
    `max_sites_allowed` INT NOT NULL DEFAULT 3 COMMENT 'Sites max créés',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `is_banned` BOOLEAN NOT NULL DEFAULT FALSE,
    `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
    `two_factor_secret` TEXT DEFAULT NULL,
    
    -- Activité
    `last_login_at` TIMESTAMP NULL DEFAULT NULL,
    `last_login_ip` VARCHAR(45) DEFAULT NULL,
    
    -- Métadonnées
    `settings` JSON DEFAULT NULL COMMENT 'Préférences',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `users_uuid_unique` (`uuid`),
    UNIQUE KEY `users_username_unique` (`username`),
    UNIQUE KEY `users_email_unique` (`email`),
    UNIQUE KEY `users_sponsor_code_unique` (`sponsor_code`),
    INDEX `users_role_index` (`role`),
    INDEX `users_sponsor_id_index` (`sponsor_id`),
    INDEX `users_is_active_index` (`is_active`),
    CONSTRAINT `users_sponsor_id_foreign` FOREIGN KEY (`sponsor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Utilisateurs';

-- Relations de parrainage
DROP TABLE IF EXISTS `referral_relationships`;
CREATE TABLE `referral_relationships` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `sponsor_id` BIGINT UNSIGNED NOT NULL COMMENT 'Parrain',
    `referred_id` BIGINT UNSIGNED NOT NULL COMMENT 'Filleul',
    `level` INT NOT NULL DEFAULT 1 COMMENT 'Niveau (1,2,3...)',
    `commission_percentage` DECIMAL(5, 2) NOT NULL COMMENT '% commission niveau',
    `status` ENUM('pending', 'active', 'inactive') NOT NULL DEFAULT 'active',
    `total_earned` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Total gagné',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `referral_relationships_unique` (`sponsor_id`, `referred_id`),
    INDEX `referral_relationships_sponsor_index` (`sponsor_id`),
    INDEX `referral_relationships_referred_index` (`referred_id`),
    INDEX `referral_relationships_level_index` (`level`),
    CONSTRAINT `referral_relationships_sponsor_foreign` FOREIGN KEY (`sponsor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `referral_relationships_referred_foreign` FOREIGN KEY (`referred_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relations parrainage';

-- Commissions gagnées
DROP TABLE IF EXISTS `referral_commissions`;
CREATE TABLE `referral_commissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `referral_relationship_id` BIGINT UNSIGNED NOT NULL COMMENT 'Relation parente',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Qui reçoit',
    `from_user_id` BIGINT UNSIGNED NOT NULL COMMENT 'De qui vient',
    `type` ENUM('registration', 'deposit', 'order', 'subscription', 'site_purchase') NOT NULL COMMENT 'Type commission',
    
    -- Références
    `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Si commission sur commande',
    `transaction_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Si commission sur transaction',
    `subscription_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Si commission sur abonnement',
    
    -- Montants
    `amount` DECIMAL(15, 6) NOT NULL COMMENT 'Montant commission',
    `percentage` DECIMAL(5, 2) NOT NULL COMMENT '% appliqué',
    `level` INT NOT NULL COMMENT 'Niveau parrainage',
    
    -- Statut
    `status` ENUM('pending', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'pending',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date paiement',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `referral_commissions_user_id_index` (`user_id`),
    INDEX `referral_commissions_from_user_id_index` (`from_user_id`),
    INDEX `referral_commissions_type_index` (`type`),
    INDEX `referral_commissions_status_index` (`status`),
    CONSTRAINT `referral_commissions_relationship_foreign` FOREIGN KEY (`referral_relationship_id`) REFERENCES `referral_relationships` (`id`) ON DELETE CASCADE,
    CONSTRAINT `referral_commissions_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `referral_commissions_from_user_foreign` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `referral_commissions_order_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
    CONSTRAINT `referral_commissions_transaction_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Commissions parrainage';

-- ============================================
-- 2. PARAMÈTRES PLATEFORME & FRAIS
-- ============================================

-- Paramètres globaux
DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clé paramètre',
    `value` TEXT NOT NULL COMMENT 'Valeur',
    `type` ENUM('string', 'integer', 'decimal', 'boolean', 'json', 'array') NOT NULL DEFAULT 'string' COMMENT 'Type valeur',
    `category` VARCHAR(50) NOT NULL COMMENT 'Catégorie',
    `group` VARCHAR(50) NOT NULL COMMENT 'Groupe',
    `is_public` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Public ou admin seulement',
    `editable` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Modifiable via admin',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `platform_settings_key_unique` (`key`),
    INDEX `platform_settings_category_index` (`category`),
    INDEX `platform_settings_group_index` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Paramètres plateforme';

-- Structure des frais
DROP TABLE IF EXISTS `fee_structures`;
CREATE TABLE `fee_structures` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom frais',
    `type` ENUM('deposit', 'withdrawal', 'order', 'subscription', 'site_purchase') NOT NULL COMMENT 'Type frais',
    `calculation_type` ENUM('percentage', 'fixed', 'tiered') NOT NULL DEFAULT 'percentage' COMMENT 'Mode calcul',
    
    -- Valeurs
    `percentage_value` DECIMAL(5, 2) DEFAULT NULL COMMENT '% si pourcentage',
    `fixed_value` DECIMAL(10, 4) DEFAULT NULL COMMENT 'Montant fixe',
    `tiered_rates` JSON DEFAULT NULL COMMENT '[{min:0, max:100, rate:5}, ...]',
    
    -- Limites
    `min_amount` DECIMAL(10, 4) DEFAULT NULL COMMENT 'Minimum',
    `max_amount` DECIMAL(10, 4) DEFAULT NULL COMMENT 'Maximum',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `applies_to` JSON DEFAULT NULL COMMENT 'Méthodes paiement spécifiques',
    `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Créé par admin',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `fee_structures_type_index` (`type`),
    INDEX `fee_structures_is_active_index` (`is_active`),
    CONSTRAINT `fee_structures_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Structure frais';

-- Fournisseurs API externes
DROP TABLE IF EXISTS `api_providers`;
CREATE TABLE `api_providers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom fournisseur',
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Code interne',
    `base_url` TEXT NOT NULL COMMENT 'URL API',
    
    -- Authentification
    `api_key` TEXT NOT NULL COMMENT 'Clé API (chiffrée)',
    `api_secret` TEXT DEFAULT NULL COMMENT 'Secret (chiffré)',
    
    -- Solde
    `balance` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Solde chez fournisseur',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    
    -- Performance
    `status` ENUM('active', 'inactive', 'testing') NOT NULL DEFAULT 'active',
    `priority` INT NOT NULL DEFAULT 1 COMMENT 'Priorité (1=premier choix)',
    `success_rate` DECIMAL(5, 2) NOT NULL DEFAULT 100.00 COMMENT 'Taux réussite %',
    `response_time_ms` INT DEFAULT NULL COMMENT 'Temps réponse moyen ms',
    `last_checked_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Dernier check',
    
    -- Configuration
    `config` JSON DEFAULT NULL COMMENT 'Config spécifique',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `api_providers_code_unique` (`code`),
    INDEX `api_providers_status_index` (`status`),
    INDEX `api_providers_priority_index` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fournisseurs API';

-- ============================================
-- 3. SERVICES & CATÉGORIES
-- ============================================

-- Catégories
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom catégorie',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Slug URL',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT 'Classe icône (FontAwesome)',
    `description` TEXT DEFAULT NULL COMMENT 'Description',
    `position` INT NOT NULL DEFAULT 0 COMMENT 'Ordre affichage',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Active',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `categories_slug_unique` (`slug`),
    INDEX `categories_position_index` (`position`),
    INDEX `categories_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catégories services';

-- Services
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT UNSIGNED NOT NULL COMMENT 'Catégorie parente',
    `api_provider_id` BIGINT UNSIGNED NOT NULL COMMENT 'Fournisseur',
    `external_id` VARCHAR(100) NOT NULL COMMENT 'ID chez fournisseur',
    `name` VARCHAR(255) NOT NULL COMMENT 'Nom service',
    `description` TEXT DEFAULT NULL COMMENT 'Description',
    `type` ENUM('default', 'custom_comments', 'package') NOT NULL DEFAULT 'default' COMMENT 'Type service',
    
    -- Quantités
    `min_quantity` INT NOT NULL DEFAULT 1 COMMENT 'Minimum',
    `max_quantity` INT NOT NULL DEFAULT 10000 COMMENT 'Maximum',
    
    -- Prix
    `cost_per_unit` DECIMAL(12, 6) NOT NULL COMMENT 'Coût chez fournisseur',
    `base_price_per_unit` DECIMAL(12, 6) NOT NULL COMMENT 'Prix de base',
    `user_margin_percent` DECIMAL(5, 2) NOT NULL DEFAULT 30.00 COMMENT 'Marge utilisateur %',
    
    -- Configuration fournisseur
    `provider` VARCHAR(100) NOT NULL COMMENT 'Nom fournisseur',
    `provider_config` JSON DEFAULT NULL COMMENT 'Config spécifique',
    
    -- Détails livraison
    `average_time` VARCHAR(50) DEFAULT NULL COMMENT 'Temps moyen livraison',
    `quality_score` INT NOT NULL DEFAULT 5 COMMENT 'Score qualité 1-10',
    `drip_feed` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Livraison échelonnée',
    `refill_guarantee_days` INT DEFAULT NULL COMMENT 'Jours garantie rechargement',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Actif',
    `is_featured` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'En vedette',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Ordre tri',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `services_external_unique` (`api_provider_id`, `external_id`),
    INDEX `services_category_id_index` (`category_id`),
    INDEX `services_api_provider_id_index` (`api_provider_id`),
    INDEX `services_type_index` (`type`),
    INDEX `services_is_active_index` (`is_active`),
    INDEX `services_sort_order_index` (`sort_order`),
    CONSTRAINT `services_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
    CONSTRAINT `services_api_provider_id_foreign` FOREIGN KEY (`api_provider_id`) REFERENCES `api_providers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Services SMM';

-- Surcharges prix
DROP TABLE IF EXISTS `service_prices_override`;
CREATE TABLE `service_prices_override` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT UNSIGNED NOT NULL COMMENT 'Service',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Utilisateur spécifique',
    `white_label_site_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Site spécifique',
    `custom_price` DECIMAL(12, 6) NOT NULL COMMENT 'Prix personnalisé',
    `custom_margin_percent` DECIMAL(5, 2) DEFAULT NULL COMMENT 'Marge personnalisée %',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Actif',
    `starts_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Début validité',
    `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Fin validité',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `service_prices_override_unique` (`service_id`, `user_id`, `white_label_site_id`),
    INDEX `service_prices_override_service_id_index` (`service_id`),
    INDEX `service_prices_override_user_id_index` (`user_id`),
    INDEX `service_prices_override_site_id_index` (`white_label_site_id`),
    INDEX `service_prices_override_is_active_index` (`is_active`),
    CONSTRAINT `service_prices_override_service_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    CONSTRAINT `service_prices_override_user_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `service_prices_override_site_foreign` FOREIGN KEY (`white_label_site_id`) REFERENCES `white_label_sites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Surcharges prix services';

-- ============================================
-- 4. COMMANDES & SUIVI
-- ============================================

-- Commandes
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Client',
    `service_id` BIGINT UNSIGNED NOT NULL COMMENT 'Service commandé',
    
    -- Origine commande
    `white_label_site_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Si via site white-label',
    `api_key_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Si via API',
    
    -- ID externes
    `external_order_id` VARCHAR(100) DEFAULT NULL COMMENT 'ID chez fournisseur',
    `external_provider_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Fournisseur utilisé',
    
    -- Détails commande
    `link` TEXT NOT NULL COMMENT 'URL cible',
    `quantity` INT NOT NULL COMMENT 'Quantité',
    
    -- Prix et coûts
    `cost_price` DECIMAL(15, 6) NOT NULL COMMENT 'Coût fournisseur',
    `sell_price` DECIMAL(15, 6) NOT NULL COMMENT 'Prix client',
    `margin_amount` DECIMAL(15, 6) NOT NULL COMMENT 'Marge réalisée',
    `commission_amount` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Commission parrainage',
    `fees_amount` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Frais',
    `net_amount` DECIMAL(15, 6) NOT NULL COMMENT 'Net pour plateforme',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    
    -- Statut
    `status` ENUM('pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'refunded', 'failed') NOT NULL DEFAULT 'pending',
    
    -- Suivi livraison
    `start_count` INT DEFAULT NULL COMMENT 'Compteur début',
    `remains` INT DEFAULT NULL COMMENT 'Reste à livrer',
    `progress_percentage` INT NOT NULL DEFAULT 0 COMMENT 'Progression %',
    
    -- Données personnalisées
    `custom_data` JSON DEFAULT NULL COMMENT 'Commentaires personnalisés, etc.',
    
    -- Métadonnées
    `admin_notes` TEXT DEFAULT NULL COMMENT 'Notes admin',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP commande',
    `user_agent` TEXT DEFAULT NULL COMMENT 'User agent',
    `placed_via` ENUM('website', 'api', 'reseller_site', 'mobile') NOT NULL DEFAULT 'website' COMMENT 'Source',
    
    -- Dates importantes
    `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date complétion',
    `refilled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date rechargement',
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date annulation',
    `refunded_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date remboursement',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `orders_uuid_unique` (`uuid`),
    UNIQUE KEY `orders_external_unique` (`external_provider_id`, `external_order_id`),
    INDEX `orders_user_id_index` (`user_id`),
    INDEX `orders_service_id_index` (`service_id`),
    INDEX `orders_status_index` (`status`),
    INDEX `orders_white_label_site_id_index` (`white_label_site_id`),
    INDEX `orders_created_at_index` (`created_at`),
    CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `orders_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE,
    CONSTRAINT `orders_white_label_site_id_foreign` FOREIGN KEY (`white_label_site_id`) REFERENCES `white_label_sites` (`id`) ON DELETE SET NULL,
    CONSTRAINT `orders_external_provider_id_foreign` FOREIGN KEY (`external_provider_id`) REFERENCES `api_providers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Commandes';

-- ============================================
-- 5. PAIEMENTS & TRANSACTIONS
-- ============================================

-- Méthodes paiement
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom méthode',
    `code` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Code interne',
    `logo` VARCHAR(500) DEFAULT NULL COMMENT 'URL logo',
    `type` ENUM('card', 'crypto', 'bank_transfer', 'ewallet', 'mobile_money') NOT NULL COMMENT 'Type',
    
    -- Frais
    `fee_structure_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Structure frais',
    
    -- Limites
    `min_amount` DECIMAL(12, 4) NOT NULL DEFAULT 1.0000 COMMENT 'Minimum',
    `max_amount` DECIMAL(12, 4) DEFAULT NULL COMMENT 'Maximum',
    
    -- Configuration
    `currencies` JSON NOT NULL COMMENT 'Devises acceptées',
    `countries` JSON DEFAULT NULL COMMENT 'Pays acceptés',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Active',
    `require_kyc` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'KYC requis',
    `config` JSON NOT NULL COMMENT 'Configuration (chiffrée)',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Ordre affichage',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `payment_methods_code_unique` (`code`),
    INDEX `payment_methods_type_index` (`type`),
    INDEX `payment_methods_is_active_index` (`is_active`),
    INDEX `payment_methods_sort_order_index` (`sort_order`),
    CONSTRAINT `payment_methods_fee_structure_foreign` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Méthodes paiement';

-- Transactions
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Utilisateur',
    `payment_method_id` BIGINT UNSIGNED NOT NULL COMMENT 'Méthode paiement',
    
    -- Type
    `type` ENUM('deposit', 'withdrawal', 'order_payment', 'refund', 'commission', 'transfer', 'site_purchase', 'subscription') NOT NULL,
    `sub_type` VARCHAR(50) DEFAULT NULL COMMENT 'Sous-type',
    
    -- Montants
    `amount` DECIMAL(15, 6) NOT NULL COMMENT 'Montant brut',
    `fees` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Frais',
    `net_amount` DECIMAL(15, 6) NOT NULL COMMENT 'Montant net',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    
    -- Statut
    `status` ENUM('pending', 'completed', 'failed', 'cancelled', 'on_hold', 'refunded') NOT NULL DEFAULT 'pending',
    
    -- Gateway
    `gateway` VARCHAR(50) DEFAULT NULL COMMENT 'Processeur',
    `gateway_transaction_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID transaction gateway',
    `gateway_response` JSON DEFAULT NULL COMMENT 'Réponse gateway',
    
    -- Métadonnées
    `reference` VARCHAR(100) DEFAULT NULL COMMENT 'Référence utilisateur',
    `description` TEXT DEFAULT NULL COMMENT 'Description',
    `admin_notes` TEXT DEFAULT NULL COMMENT 'Notes admin',
    `metadata` JSON DEFAULT NULL COMMENT 'Métadonnées supplémentaires',
    `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP transaction',
    
    -- Vérification
    `verified_by` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Vérifié par admin',
    `verified_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date vérification',
    `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date complétion',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `transactions_uuid_unique` (`uuid`),
    INDEX `transactions_user_id_index` (`user_id`),
    INDEX `transactions_type_index` (`type`),
    INDEX `transactions_status_index` (`status`),
    INDEX `transactions_created_at_index` (`created_at`),
    CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `transactions_payment_method_id_foreign` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE CASCADE,
    CONSTRAINT `transactions_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Transactions';

-- Factures
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `invoice_number` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Numéro facture',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Client',
    
    -- Références
    `transaction_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Transaction associée',
    `subscription_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Abonnement associé',
    
    -- Type
    `type` ENUM('deposit', 'order', 'subscription', 'site_purchase', 'custom') NOT NULL,
    
    -- Montants
    `amount` DECIMAL(15, 6) NOT NULL COMMENT 'Montant HT',
    `tax_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Taux TVA %',
    `tax_amount` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Montant TVA',
    `total_amount` DECIMAL(15, 6) NOT NULL COMMENT 'Total TTC',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    
    -- Statut
    `status` ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') NOT NULL DEFAULT 'draft',
    
    -- Dates
    `due_date` DATE NOT NULL COMMENT 'Date échéance',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date paiement',
    
    -- Informations
    `billing_info` JSON NOT NULL COMMENT 'Infos facturation',
    `items` JSON NOT NULL COMMENT 'Articles facture',
    `notes` TEXT DEFAULT NULL COMMENT 'Notes',
    
    -- Fichier
    `pdf_path` VARCHAR(500) DEFAULT NULL COMMENT 'Chemin PDF',
    `sent_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date envoi',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `invoices_uuid_unique` (`uuid`),
    UNIQUE KEY `invoices_invoice_number_unique` (`invoice_number`),
    INDEX `invoices_user_id_index` (`user_id`),
    INDEX `invoices_status_index` (`status`),
    INDEX `invoices_due_date_index` (`due_date`),
    CONSTRAINT `invoices_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `invoices_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Factures';

-- ============================================
-- 6. WHITE-LABEL & SITES
-- ============================================

-- Modèles de site
DROP TABLE IF EXISTS `white_label_templates`;
CREATE TABLE `white_label_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom template',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Slug',
    `description` TEXT DEFAULT NULL COMMENT 'Description',
    `preview_image` VARCHAR(500) DEFAULT NULL COMMENT 'Image preview',
    
    -- Type déploiement
    `template_type` ENUM('full_download', 'hosted', 'api_only') NOT NULL DEFAULT 'full_download' COMMENT 'Type',
    
    -- Prix
    `base_price` DECIMAL(10, 2) NOT NULL COMMENT 'Prix base',
    `monthly_price` DECIMAL(10, 2) NOT NULL COMMENT 'Prix mensuel',
    `setup_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Frais setup',
    
    -- Fonctionnalités
    `features` JSON NOT NULL COMMENT 'Fonctionnalités incluses',
    
    -- Fichiers
    `files_path` VARCHAR(500) DEFAULT NULL COMMENT 'Chemin fichiers téléchargement',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Actif',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Ordre affichage',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `white_label_templates_slug_unique` (`slug`),
    INDEX `white_label_templates_type_index` (`template_type`),
    INDEX `white_label_templates_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Templates sites';

-- Plans (abonnements)
DROP TABLE IF EXISTS `white_label_plans`;
CREATE TABLE `white_label_plans` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom plan',
    `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Slug',
    `description` TEXT DEFAULT NULL COMMENT 'Description',
    
    -- Prix
    `monthly_price` DECIMAL(10, 2) NOT NULL COMMENT 'Prix mensuel',
    `yearly_price` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Prix annuel (-20%)',
    `setup_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Frais setup',
    `transaction_fee_percent` DECIMAL(5, 2) NOT NULL DEFAULT 5.00 COMMENT '% commission',
    
    -- Fonctionnalités et limites
    `features` JSON NOT NULL COMMENT '[{name: "API", enabled: true}, ...]',
    `limits` JSON NOT NULL COMMENT '{max_users: 100, max_orders: 1000}',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Actif',
    `is_featured` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'En vedette',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT 'Ordre affichage',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `white_label_plans_slug_unique` (`slug`),
    INDEX `white_label_plans_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Plans white-label';

-- Sites white-label
DROP TABLE IF EXISTS `white_label_sites`;
CREATE TABLE `white_label_sites` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    
    -- Propriétaire
    `owner_id` BIGINT UNSIGNED NOT NULL COMMENT 'Propriétaire',
    
    -- Configuration
    `template_id` BIGINT UNSIGNED NOT NULL COMMENT 'Template utilisé',
    `plan_id` BIGINT UNSIGNED NOT NULL COMMENT 'Plan actuel',
    
    -- Informations site
    `site_name` VARCHAR(200) NOT NULL COMMENT 'Nom site',
    `site_url` VARCHAR(500) NOT NULL COMMENT 'URL principale',
    `subdomain` VARCHAR(100) UNIQUE DEFAULT NULL COMMENT 'Sous-domaine client.votresite.com',
    `custom_domain` VARCHAR(255) UNIQUE DEFAULT NULL COMMENT 'Domaine personnalisé',
    
    -- Statut
    `status` ENUM('draft', 'pending', 'active', 'suspended', 'expired', 'cancelled') NOT NULL DEFAULT 'draft',
    
    -- Déploiement
    `deployment_type` ENUM('self_hosted', 'hosted_by_us', 'cloud_hosted') NOT NULL DEFAULT 'self_hosted',
    `hosting_details` JSON DEFAULT NULL COMMENT '{provider: "netlify", url: "...", credentials: {...}}',
    
    -- Branding
    `branding` JSON NOT NULL COMMENT '{logo: "...", colors: {...}, favicon: "...", name: "..."}',
    
    -- Configuration
    `configuration` JSON NOT NULL COMMENT 'Toute la config',
    `allowed_services` JSON DEFAULT NULL COMMENT 'Services autorisés',
    
    -- Prix
    `price_multiplier` DECIMAL(5, 2) NOT NULL DEFAULT 1.00 COMMENT 'Coefficient prix',
    `margin_percent` DECIMAL(5, 2) NOT NULL DEFAULT 20.00 COMMENT 'Marge revendeur %',
    
    -- Statistiques
    `statistics` JSON NOT NULL DEFAULT '{"total_orders":0,"total_revenue":0,"active_users":0}' COMMENT 'Stats site',
    
    -- Dates importantes
    `last_payment_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Dernier paiement',
    `next_payment_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Prochain paiement',
    `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date expiration',
    `suspended_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date suspension',
    `cancellation_requested_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date demande annulation',
    
    -- Notes
    `notes` TEXT DEFAULT NULL COMMENT 'Notes admin',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `white_label_sites_uuid_unique` (`uuid`),
    UNIQUE KEY `white_label_sites_subdomain_unique` (`subdomain`),
    UNIQUE KEY `white_label_sites_custom_domain_unique` (`custom_domain`),
    INDEX `white_label_sites_owner_id_index` (`owner_id`),
    INDEX `white_label_sites_status_index` (`status`),
    INDEX `white_label_sites_template_id_index` (`template_id`),
    INDEX `white_label_sites_plan_id_index` (`plan_id`),
    CONSTRAINT `white_label_sites_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `white_label_sites_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `white_label_templates` (`id`) ON DELETE CASCADE,
    CONSTRAINT `white_label_sites_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `white_label_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Sites white-label';

-- Commandes de site
DROP TABLE IF EXISTS `site_orders`;
CREATE TABLE `site_orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Client',
    
    -- Configuration achetée
    `template_id` BIGINT UNSIGNED NOT NULL COMMENT 'Template acheté',
    `plan_id` BIGINT UNSIGNED NOT NULL COMMENT 'Plan acheté',
    
    -- Transaction
    `transaction_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Transaction paiement',
    
    -- Type
    `type` ENUM('new_purchase', 'renewal', 'upgrade', 'downgrade') NOT NULL DEFAULT 'new_purchase',
    
    -- Montants
    `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Montant plan',
    `setup_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Frais setup',
    `total_amount` DECIMAL(10, 2) NOT NULL COMMENT 'Total',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    
    -- Statut
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    
    -- Déploiement
    `deployment_type` ENUM('self_hosted', 'hosted_by_us', 'cloud_hosted') NOT NULL DEFAULT 'self_hosted',
    `hosting_preferences` JSON DEFAULT NULL COMMENT 'Préférences hébergement',
    `custom_requirements` TEXT DEFAULT NULL COMMENT 'Exigences personnalisées',
    
    -- Livraison
    `download_link` VARCHAR(500) DEFAULT NULL COMMENT 'Lien téléchargement',
    `download_expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiration lien',
    `deployed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date déploiement',
    `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date complétion',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `site_orders_uuid_unique` (`uuid`),
    INDEX `site_orders_user_id_index` (`user_id`),
    INDEX `site_orders_status_index` (`status`),
    INDEX `site_orders_template_id_index` (`template_id`),
    CONSTRAINT `site_orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `site_orders_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `white_label_templates` (`id`) ON DELETE CASCADE,
    CONSTRAINT `site_orders_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `white_label_plans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `site_orders_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Commandes sites';

-- Abonnements
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Utilisateur',
    
    -- Site associé (si abonnement site)
    `white_label_site_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Site abonné',
    
    -- Plan
    `plan_id` BIGINT UNSIGNED NOT NULL COMMENT 'Plan',
    `template_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Template (si site)',
    
    -- Statut
    `status` ENUM('active', 'pending', 'cancelled', 'expired', 'suspended') NOT NULL DEFAULT 'pending',
    
    -- Montant
    `amount` DECIMAL(10, 2) NOT NULL COMMENT 'Montant',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
    `interval` ENUM('monthly', 'yearly', 'lifetime') NOT NULL DEFAULT 'monthly',
    
    -- Dates
    `starts_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Début',
    `ends_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Fin',
    `trial_ends_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Fin période essai',
    `cancelled_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date annulation',
    
    -- Paiement
    `payment_method` VARCHAR(50) DEFAULT NULL COMMENT 'Méthode paiement',
    `gateway_subscription_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID abonnement gateway',
    
    -- Métadonnées
    `metadata` JSON DEFAULT NULL,
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `subscriptions_uuid_unique` (`uuid`),
    INDEX `subscriptions_user_id_index` (`user_id`),
    INDEX `subscriptions_status_index` (`status`),
    INDEX `subscriptions_white_label_site_id_index` (`white_label_site_id`),
    CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `subscriptions_white_label_site_id_foreign` FOREIGN KEY (`white_label_site_id`) REFERENCES `white_label_sites` (`id`) ON DELETE CASCADE,
    CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `white_label_plans` (`id`) ON DELETE CASCADE,
    CONSTRAINT `subscriptions_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `white_label_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Abonnements';

-- ============================================
-- 7. API & DÉVELOPPEURS
-- ============================================

-- Clés API
DROP TABLE IF EXISTS `api_keys`;
CREATE TABLE `api_keys` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Propriétaire',
    
    -- Identification
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom clé (ex: "Site web")',
    `key` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Clé API publique',
    `secret` VARCHAR(128) NOT NULL COMMENT 'Secret (chiffré)',
    
    -- Permissions
    `type` ENUM('public', 'secret') NOT NULL DEFAULT 'secret' COMMENT 'Type',
    `permissions` JSON NOT NULL COMMENT 'Permissions',
    
    -- Sécurité
    `whitelist_ips` JSON DEFAULT NULL COMMENT 'IPs autorisées',
    
    -- Limites
    `rate_limit` INT NOT NULL DEFAULT 100 COMMENT 'Requêtes/minute',
    `daily_requests` INT NOT NULL DEFAULT 0 COMMENT 'Requêtes aujourd\'hui',
    
    -- Utilisation
    `last_used_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Dernière utilisation',
    `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date expiration',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Active',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `api_keys_key_unique` (`key`),
    INDEX `api_keys_user_id_index` (`user_id`),
    INDEX `api_keys_is_active_index` (`is_active`),
    CONSTRAINT `api_keys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Clés API';

-- Logs API
DROP TABLE IF EXISTS `api_logs`;
CREATE TABLE `api_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `api_key_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Clé API utilisée',
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Utilisateur',
    
    -- Requête
    `method` VARCHAR(10) NOT NULL COMMENT 'GET, POST, etc.',
    `endpoint` VARCHAR(500) NOT NULL COMMENT 'Endpoint appelé',
    `request_headers` JSON DEFAULT NULL COMMENT 'Headers requête',
    `request_body` JSON DEFAULT NULL COMMENT 'Body requête',
    
    -- Réponse
    `response_code` INT NOT NULL COMMENT 'Code HTTP réponse',
    `response_body` JSON DEFAULT NULL COMMENT 'Body réponse',
    
    -- Métadonnées
    `ip_address` VARCHAR(45) NOT NULL COMMENT 'IP appelant',
    `user_agent` TEXT DEFAULT NULL COMMENT 'User agent',
    `duration_ms` INT NOT NULL COMMENT 'Durée requête ms',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `api_logs_api_key_id_index` (`api_key_id`),
    INDEX `api_logs_user_id_index` (`user_id`),
    INDEX `api_logs_endpoint_index` (`endpoint`),
    INDEX `api_logs_response_code_index` (`response_code`),
    INDEX `api_logs_created_at_index` (`created_at`),
    CONSTRAINT `api_logs_api_key_id_foreign` FOREIGN KEY (`api_key_id`) REFERENCES `api_keys` (`id`) ON DELETE SET NULL,
    CONSTRAINT `api_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs API';

-- Logs fournisseurs
DROP TABLE IF EXISTS `provider_logs`;
CREATE TABLE `provider_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Commande concernée',
    `provider_name` VARCHAR(100) NOT NULL COMMENT 'Nom fournisseur',
    `action` VARCHAR(50) NOT NULL COMMENT 'create_order, check_status, etc.',
    
    -- Requête
    `request_url` TEXT NOT NULL COMMENT 'URL appelée',
    `request_payload` JSON DEFAULT NULL COMMENT 'Payload envoyé',
    
    -- Réponse
    `response_code` INT NOT NULL COMMENT 'Code HTTP',
    `response_body` JSON DEFAULT NULL COMMENT 'Réponse brute',
    `error_message` TEXT DEFAULT NULL COMMENT 'Message erreur',
    
    -- Performance
    `duration_ms` INT NOT NULL COMMENT 'Durée ms',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `provider_logs_order_id_index` (`order_id`),
    INDEX `provider_logs_provider_name_index` (`provider_name`),
    INDEX `provider_logs_action_index` (`action`),
    INDEX `provider_logs_created_at_index` (`created_at`),
    CONSTRAINT `provider_logs_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs fournisseurs';

-- ============================================
-- 8. SUPPORT & NOTIFICATIONS
-- ============================================

-- Tickets support
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE `tickets` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID public',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Créateur',
    `white_label_site_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Site concerné',
    
    -- Attribution
    `assigned_to` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Assigné à (admin)',
    
    -- Classification
    `department` ENUM('support', 'billing', 'technical', 'sales', 'abuse') NOT NULL DEFAULT 'support',
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    `status` ENUM('open', 'answered', 'closed', 'pending') NOT NULL DEFAULT 'open',
    
    -- Contenu
    `subject` VARCHAR(255) NOT NULL COMMENT 'Sujet',
    
    -- Dates
    `last_reply_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Dernière réponse',
    `closed_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date fermeture',
    `closed_by` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Fermé par',
    
    -- Métadonnées
    `metadata` JSON DEFAULT NULL COMMENT 'Métadonnées',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `tickets_uuid_unique` (`uuid`),
    INDEX `tickets_user_id_index` (`user_id`),
    INDEX `tickets_status_index` (`status`),
    INDEX `tickets_priority_index` (`priority`),
    INDEX `tickets_department_index` (`department`),
    CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `tickets_white_label_site_id_foreign` FOREIGN KEY (`white_label_site_id`) REFERENCES `white_label_sites` (`id`) ON DELETE SET NULL,
    CONSTRAINT `tickets_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `tickets_closed_by_foreign` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tickets support';

-- Messages tickets
DROP TABLE IF EXISTS `ticket_messages`;
CREATE TABLE `ticket_messages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `ticket_id` BIGINT UNSIGNED NOT NULL COMMENT 'Ticket parent',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Auteur',
    `message` TEXT NOT NULL COMMENT 'Contenu message',
    `attachments` JSON DEFAULT NULL COMMENT 'Fichiers joints',
    `is_internal` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Message interne staff',
    `read_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date lecture',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `ticket_messages_ticket_id_index` (`ticket_id`),
    INDEX `ticket_messages_user_id_index` (`user_id`),
    INDEX `ticket_messages_created_at_index` (`created_at`),
    CONSTRAINT `ticket_messages_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
    CONSTRAINT `ticket_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Messages tickets';

-- Notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` CHAR(36) NOT NULL COMMENT 'UUID',
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Destinataire',
    
    -- Contenu
    `type` ENUM('info', 'warning', 'success', 'error', 'system') NOT NULL DEFAULT 'info',
    `title` VARCHAR(255) NOT NULL COMMENT 'Titre',
    `message` TEXT NOT NULL COMMENT 'Message',
    `data` JSON DEFAULT NULL COMMENT 'Données supplémentaires',
    
    -- Action
    `icon` VARCHAR(50) DEFAULT NULL COMMENT 'Icône',
    `action_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL action',
    `action_label` VARCHAR(100) DEFAULT NULL COMMENT 'Label bouton',
    
    -- Statut
    `is_read` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Lu',
    `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiration',
    `read_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date lecture',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `notifications_uuid_unique` (`uuid`),
    INDEX `notifications_user_id_index` (`user_id`),
    INDEX `notifications_type_index` (`type`),
    INDEX `notifications_is_read_index` (`is_read`),
    INDEX `notifications_created_at_index` (`created_at`),
    CONSTRAINT `notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notifications';

-- ============================================
-- 9. STATISTIQUES & AUDIT
-- ============================================

-- Stats utilisateur (quotidiennes)
DROP TABLE IF EXISTS `user_statistics`;
CREATE TABLE `user_statistics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Utilisateur',
    `period` DATE NOT NULL COMMENT 'Date des stats',
    
    -- Commandes
    `total_orders` INT NOT NULL DEFAULT 0 COMMENT 'Commandes totales',
    `total_spent` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Total dépensé',
    
    -- Gains
    `total_earned` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Total gagné',
    
    -- Transactions
    `total_deposits` INT NOT NULL DEFAULT 0 COMMENT 'Dépôts',
    `total_withdrawals` INT NOT NULL DEFAULT 0 COMMENT 'Retraits',
    
    -- Parrainage
    `referral_count` INT NOT NULL DEFAULT 0 COMMENT 'Nombre filleuls',
    `referral_earnings` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Gains parrainage',
    
    -- Sites
    `site_count` INT NOT NULL DEFAULT 0 COMMENT 'Sites créés',
    `subscription_count` INT NOT NULL DEFAULT 0 COMMENT 'Abonnements actifs',
    
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_statistics_unique` (`user_id`, `period`),
    INDEX `user_statistics_user_id_index` (`user_id`),
    INDEX `user_statistics_period_index` (`period`),
    CONSTRAINT `user_statistics_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stats utilisateur';

-- Stats plateforme (quotidiennes)
DROP TABLE IF EXISTS `platform_statistics`;
CREATE TABLE `platform_statistics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `period` DATE NOT NULL COMMENT 'Date stats',
    
    -- Utilisateurs
    `total_users` INT NOT NULL DEFAULT 0 COMMENT 'Total utilisateurs',
    `new_users` INT NOT NULL DEFAULT 0 COMMENT 'Nouveaux utilisateurs',
    `active_users` INT NOT NULL DEFAULT 0 COMMENT 'Utilisateurs actifs',
    
    -- Commandes
    `total_orders` INT NOT NULL DEFAULT 0 COMMENT 'Commandes totales',
    `total_revenue` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Chiffre d\'affaires',
    `total_profit` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Bénéfice net',
    
    -- Transactions
    `total_deposits` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Total dépôts',
    `total_withdrawals` DECIMAL(15, 6) NOT NULL DEFAULT 0.000000 COMMENT 'Total retraits',
    
    -- Sites
    `total_sites` INT NOT NULL DEFAULT 0 COMMENT 'Sites créés',
    `total_subscriptions` INT NOT NULL DEFAULT 0 COMMENT 'Abonnements actifs',
    
    -- Performance
    `conversion_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT 'Taux conversion %',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `platform_statistics_period_unique` (`period`),
    INDEX `platform_statistics_period_index` (`period`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stats plateforme';

-- Logs d'audit
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Utilisateur ayant fait l\'action',
    
    -- Action
    `action` VARCHAR(100) NOT NULL COMMENT 'user.created, order.placed, etc.',
    `model_type` VARCHAR(255) DEFAULT NULL COMMENT 'Modèle concerné',
    `model_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'ID modèle',
    
    -- Changements
    `old_values` JSON DEFAULT NULL COMMENT 'Valeurs avant',
    `new_values` JSON DEFAULT NULL COMMENT 'Valeurs après',
    
    -- Métadonnées
    `ip_address` VARCHAR(45) NOT NULL COMMENT 'IP',
    `user_agent` TEXT DEFAULT NULL COMMENT 'User agent',
    `location` JSON DEFAULT NULL COMMENT 'Données géo IP',
    `tags` JSON DEFAULT NULL COMMENT 'Tags classification',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    INDEX `audit_logs_user_id_index` (`user_id`),
    INDEX `audit_logs_action_index` (`action`),
    INDEX `audit_logs_model_index` (`model_type`, `model_id`),
    INDEX `audit_logs_created_at_index` (`created_at`),
    CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs audit';

-- ============================================
-- 10. BONUS & PROMOTIONS
-- ============================================

-- Bonus (promotions)
DROP TABLE IF EXISTS `bonuses`;
CREATE TABLE `bonuses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL COMMENT 'Nom bonus',
    `code` VARCHAR(50) UNIQUE DEFAULT NULL COMMENT 'Code promo',
    `type` ENUM('deposit', 'registration', 'order', 'referral', 'subscription') NOT NULL COMMENT 'Type',
    `amount_type` ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage' COMMENT 'Type montant',
    `amount_value` DECIMAL(10, 2) NOT NULL COMMENT 'Valeur (10% ou 10€)',
    
    -- Conditions
    `min_required` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Minimum requis',
    `max_bonus` DECIMAL(10, 2) DEFAULT NULL COMMENT 'Bonus maximum',
    `currency` VARCHAR(10) DEFAULT NULL COMMENT 'Devise applicable',
    
    -- Dates
    `starts_at` TIMESTAMP NOT NULL COMMENT 'Début',
    `expires_at` TIMESTAMP DEFAULT NULL COMMENT 'Fin',
    
    -- Utilisation
    `total_uses` INT NOT NULL DEFAULT 0 COMMENT 'Utilisations totales',
    `max_uses` INT DEFAULT NULL COMMENT 'Utilisations max',
    `per_user_limit` INT DEFAULT NULL COMMENT 'Limite par utilisateur',
    
    -- Statut
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Actif',
    
    -- Applicabilité
    `applicable_to` JSON DEFAULT NULL COMMENT 'Services/groupes spécifiques',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `bonuses_code_unique` (`code`),
    INDEX `bonuses_type_index` (`type`),
    INDEX `bonuses_is_active_index` (`is_active`),
    INDEX `bonuses_starts_at_expires_at_index` (`starts_at`, `expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bonus promotions';

-- Bonus attribués aux utilisateurs
DROP TABLE IF EXISTS `user_bonuses`;
CREATE TABLE `user_bonuses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT 'Utilisateur',
    `bonus_id` BIGINT UNSIGNED NOT NULL COMMENT 'Bonus',
    
    -- Origine
    `transaction_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Transaction associée',
    `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'Commande associée',
    
    -- Montant
    `amount` DECIMAL(15, 6) NOT NULL COMMENT 'Montant bonus',
    
    -- Statut
    `status` ENUM('pending', 'active', 'used', 'expired') NOT NULL DEFAULT 'pending',
    
    -- Dates
    `expires_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiration',
    `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Date utilisation',
    `created_at` TIMESTAMP NULL DEFAULT NULL,
    `updated_at` TIMESTAMP NULL DEFAULT NULL,
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_bonuses_unique` (`user_id`, `bonus_id`, `transaction_id`, `order_id`),
    INDEX `user_bonuses_user_id_index` (`user_id`),
    INDEX `user_bonuses_status_index` (`status`),
    CONSTRAINT `user_bonuses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `user_bonuses_bonus_id_foreign` FOREIGN KEY (`bonus_id`) REFERENCES `bonuses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `user_bonuses_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL,
    CONSTRAINT `user_bonuses_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bonus utilisateurs';

-- ============================================
-- RÉACTIVATION DES CONTRAINTES
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- INDEX SUPPLÉMENTAIRES POUR PERFORMANCE
-- ============================================

-- Index pour recherche rapide
CREATE INDEX `orders_user_status_index` ON `orders` (`user_id`, `status`);
CREATE INDEX `transactions_user_type_status_index` ON `transactions` (`user_id`, `type`, `status`);
CREATE INDEX `services_category_active_index` ON `services` (`category_id`, `is_active`);
CREATE INDEX `white_label_sites_owner_status_index` ON `white_label_sites` (`owner_id`, `status`);
CREATE INDEX `users_sponsor_active_index` ON `users` (`sponsor_id`, `is_active`);

-- ============================================
-- DONNÉES PAR DÉFAUT (OPTIONNEL)
-- ============================================

-- Insertion rôles par défaut
INSERT INTO `platform_settings` (`key`, `value`, `type`, `category`, `group`, `is_public`, `editable`) VALUES
('site_name', 'izyboost', 'string', 'general', 'site', true, true),
('site_url', 'https://izyboost.nelsius.com', 'string', 'general', 'site', true, true),
('site_email', 'support@izyboost.com', 'string', 'general', 'site', true, true),
('currency_default', 'XAF', 'string', 'general', 'site', true, true),
('language_default', 'fr', 'string', 'general', 'site', true, true),
('registration_enabled', 'true', 'boolean', 'general', 'site', true, true),
('deposit_min_amount', '150', 'decimal', 'payment', 'limits', true, true),
('deposit_max_amount', '500000', 'decimal', 'payment', 'limits', true, true),
('referral_levels', '3', 'integer', 'referral', 'commission', true, true),
('referral_commission_level_1', '10', 'decimal', 'referral', 'commission', true, true),
('referral_commission_level_2', '5', 'decimal', 'referral', 'commission', true, true),
('referral_commission_level_3', '2', 'decimal', 'referral', 'commission', true, true),
('default_user_margin', '30', 'decimal', 'services', 'pricing', false, true),
('site_monthly_price', '29.99', 'decimal', 'white_label', 'pricing', true, true),
('site_setup_fee', '49.99', 'decimal', 'white_label', 'pricing', true, true);

-- Insertion catégories par défaut
INSERT INTO `categories` (`name`, `slug`, `icon`, `description`, `position`, `is_active`) VALUES
('TikTok', 'tiktok', 'fab fa-tiktok', 'Services pour TikTok', 1, true),
('Instagram', 'instagram', 'fab fa-instagram', 'Services pour Instagram', 2, true),
('Facebook', 'facebook', 'fab fa-facebook', 'Services pour Facebook', 3, true),
('YouTube', 'youtube', 'fab fa-youtube', 'Services pour YouTube', 4, true),
('Twitter/X', 'twitter', 'fab fa-x-twitter', 'Services pour Twitter/X', 5, true),
('Telegram', 'telegram', 'fab fa-telegram', 'Services pour Telegram', 6, true),
('Spotify', 'spotify', 'fab fa-spotify', 'Services pour Spotify', 7, true),
('Autres', 'autres', 'fas fa-globe', 'Autres services', 8, true);

-- Insertion plans white-label par défaut
INSERT INTO `white_label_plans` (`name`, `slug`, `description`, `monthly_price`, `yearly_price`, `setup_fee`, `transaction_fee_percent`, `features`, `limits`, `is_active`, `is_featured`, `sort_order`) VALUES
('Starter', 'starter', 'Plan de démarrage', 19.99, 199.99, 29.99, 5.00, '[{"name":"Site complet", "enabled":true}, {"name":"Dashboard admin", "enabled":true}, {"name":"Support email", "enabled":true}]', '{"max_users":100, "max_orders_per_day":500, "max_sites":1}', true, false, 1),
('Pro', 'pro', 'Plan professionnel', 49.99, 499.99, 49.99, 3.00, '[{"name":"Site complet", "enabled":true}, {"name":"Dashboard admin", "enabled":true}, {"name":"Support prioritaire", "enabled":true}, {"name":"API accès", "enabled":true}, {"name":"Domaine personnalisé", "enabled":true}]', '{"max_users":500, "max_orders_per_day":5000, "max_sites":3}', true, true, 2),
('Enterprise', 'enterprise', 'Plan entreprise', 99.99, 999.99, 0.00, 1.00, '[{"name":"Site complet", "enabled":true}, {"name":"Dashboard admin", "enabled":true}, {"name":"Support 24/7", "enabled":true}, {"name":"API complète", "enabled":true}, {"name":"Domaine personnalisé", "enabled":true}, {"name":"Branding complet", "enabled":true}, {"name":"Déploiement personnalisé", "enabled":true}]', '{"max_users":"unlimited", "max_orders_per_day":"unlimited", "max_sites":"unlimited"}', true, false, 3);

-- Insertion templates par défaut
INSERT INTO `white_label_templates` (`name`, `slug`, `description`, `preview_image`, `template_type`, `base_price`, `monthly_price`, `setup_fee`, `features`, `files_path`, `is_active`, `sort_order`) VALUES
('BoostPanel Basic', 'boostpanel-basic', 'Template de base pour site de boost', '/images/templates/basic.jpg', 'full_download', 99.99, 19.99, 29.99, '["Design responsive", "Dashboard admin", "Paiements intégrés", "Support multilingue"]', '/templates/boostpanel-basic.zip', true, 1),
('SMM Dashboard Pro', 'smm-dashboard-pro', 'Dashboard professionnel pour SMM', '/images/templates/pro.jpg', 'hosted', 199.99, 49.99, 49.99, '["Design premium", "Analytics avancées", "API complète", "Multi-utilisateurs", "Automatisations"]', NULL, true, 2),
('API Only', 'api-only', 'Solution API uniquement', '/images/templates/api.jpg', 'api_only', 49.99, 9.99, 0.00, '["API complète", "Documentation", "Support technique", "High availability"]', NULL, true, 3);

-- ============================================
-- COMMENTAIRES FINAUX
-- ============================================

/*
STRUCTURE SIMPLIFIÉE :
1. users - Tous utilisateurs avec mêmes permissions
2. referral_* - Parrainage multi-niveau
3. platform_settings - Configuration admin
4. fee_structures - Frais configurables
5. api_providers - Fournisseurs externes
6. categories/services - Services SMM
7. orders - Commandes
8. payment_methods/transactions/invoices - Paiements
9. white_label_* - Système de sites
10. api_keys/api_logs - API développeurs
11. tickets/notifications - Support
12. statistics/audit_logs - Analytics
13. bonuses - Promotions

PERMISSIONS :
- super_admin : Tout
- admin : Gestion plateforme (pas de code source)
- user : Toutes les fonctionnalités utilisateur
  • Commander des services
  • Créer des sites white-label
  • Utiliser l'API
  • Parrainer d'autres utilisateurs
  • Gérer son portefeuille

NOTES :
- Tous les champs sensibles sont chiffrés (api_key, google_token, etc.)
- Les UUID utilisés pour références publiques
- Index optimisés pour performances
- Relations cascade/set null bien définies
- Système extensible pour futures fonctionnalités
*/