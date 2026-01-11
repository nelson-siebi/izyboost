<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhiteLabelPlan;

class WhiteLabelPlansSeeder extends Seeder
{
    public function run(): void
    {
        WhiteLabelPlan::updateOrCreate(
            ['slug' => 'starter'],
            [
                'name' => 'Starter',
                'description' => 'Idéal pour débuter votre activité de revendeur.',
                'monthly_price' => 3000.00,
                'yearly_price' => 15000.00,
                'lifetime_price' => 50000.00,
                'setup_fee' => 0.00,
                'transaction_fee_percent' => 5.00,
                'features' => [
                    ['name' => 'Site complet', 'enabled' => true],
                    ['name' => 'Sous-domaine izyboost', 'enabled' => true],
                    ['name' => 'Support standard', 'enabled' => true],
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

        WhiteLabelPlan::updateOrCreate(
            ['slug' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'Pour les revendeurs en croissance avec domaine personnalisé.',
                'monthly_price' => 5000.00,
                'yearly_price' => 50000.00,
                'lifetime_price' => 150000.00,
                'setup_fee' => 0.00,
                'transaction_fee_percent' => 2.00,
                'features' => [
                    ['name' => 'Site complet', 'enabled' => true],
                    ['name' => 'Domaine personnalisé', 'enabled' => true],
                    ['name' => 'Support prioritaire', 'enabled' => true],
                    ['name' => 'Accès API complet', 'enabled' => true],
                ],
                'limits' => [
                    'max_users' => 1000,
                    'max_orders_per_day' => 5000,
                    'max_sites' => 3,
                ],
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ]
        );

        WhiteLabelPlan::updateOrCreate(
            ['slug' => 'agency'],
            [
                'name' => 'Agency',
                'description' => 'La solution ultime sans restrictions.',
                'monthly_price' => 15000.00,
                'yearly_price' => 150000.00,
                'lifetime_price' => 450000.00,
                'setup_fee' => 0.00,
                'transaction_fee_percent' => 0.00,
                'features' => [
                    ['name' => 'Marque blanche totale', 'enabled' => true],
                    ['name' => 'Domaine personnalisé', 'enabled' => true],
                    ['name' => 'Support VIP 24/7', 'enabled' => true],
                    ['name' => 'API Illimitée', 'enabled' => true],
                    ['name' => 'Multi-devises', 'enabled' => true],
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
