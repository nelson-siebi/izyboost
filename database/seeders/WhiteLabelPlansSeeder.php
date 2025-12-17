<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhiteLabelPlan;

class WhiteLabelPlansSeeder extends Seeder
{
    public function run(): void
    {
        WhiteLabelPlan::firstOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'Plan de démarrage pour les petits revendeurs',
                'monthly_price' => 19.99,
                'yearly_price' => 199.99,
                'setup_fee' => 29.99,
                'transaction_fee_percent' => 5.00,
                'features' => [
                    ['name' => 'Site complet', 'enabled' => true],
                    ['name' => 'Dashboard admin', 'enabled' => true],
                    ['name' => 'Support email', 'enabled' => true],
                    ['name' => 'API accès', 'enabled' => false],
                ],
                'limits' => [
                    'max_users' => 100,
                    'max_orders_per_day' => 500,
                    'max_sites' => 1,
                ],
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 1,
            ]
        );

        WhiteLabelPlan::firstOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'Plan professionnel pour revendeurs sérieux',
                'monthly_price' => 49.99,
                'yearly_price' => 499.99,
                'setup_fee' => 49.99,
                'transaction_fee_percent' => 3.00,
                'features' => [
                    ['name' => 'Site complet', 'enabled' => true],
                    ['name' => 'Dashboard admin', 'enabled' => true],
                    ['name' => 'Support prioritaire', 'enabled' => true],
                    ['name' => 'API accès', 'enabled' => true],
                    ['name' => 'Domaine personnalisé', 'enabled' => true],
                ],
                'limits' => [
                    'max_users' => 500,
                    'max_orders_per_day' => 5000,
                    'max_sites' => 3,
                ],
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ]
        );

        WhiteLabelPlan::firstOrCreate(
            ['slug' => 'enterprise'],
            [
                'name' => 'Enterprise',
                'description' => 'Plan entreprise sans limites',
                'monthly_price' => 99.99,
                'yearly_price' => 999.99,
                'setup_fee' => 0.00,
                'transaction_fee_percent' => 1.00,
                'features' => [
                    ['name' => 'Site complet', 'enabled' => true],
                    ['name' => 'Dashboard admin', 'enabled' => true],
                    ['name' => 'Support 24/7', 'enabled' => true],
                    ['name' => 'API complète', 'enabled' => true],
                    ['name' => 'Domaine personnalisé', 'enabled' => true],
                    ['name' => 'Branding complet', 'enabled' => true],
                    ['name' => 'Déploiement personnalisé', 'enabled' => true],
                ],
                'limits' => [
                    'max_users' => 'unlimited',
                    'max_orders_per_day' => 'unlimited',
                    'max_sites' => 'unlimited',
                ],
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 3,
            ]
        );
    }
}
