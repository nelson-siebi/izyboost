<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WhiteLabelTemplate;

class WhiteLabelTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        WhiteLabelTemplate::firstOrCreate(
            ['slug' => 'boostpanel-basic'],
            [
                'name' => 'BoostPanel Basic',
                'description' => 'Template de base pour site de boost SMM',
                'preview_image' => '/images/templates/basic.jpg',
                'template_type' => 'hosted',
                'base_price' => 99.99,
                'monthly_price' => 19.99,
                'setup_fee' => 29.99,
                'features' => [
                    'Design responsive',
                    'Dashboard admin',
                    'Paiements intégrés',
                    'Support multilingue',
                ],
                'files_path' => null,
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        WhiteLabelTemplate::firstOrCreate(
            ['slug' => 'smm-dashboard-pro'],
            [
                'name' => 'SMM Dashboard Pro',
                'description' => 'Dashboard professionnel avec analytics avancées',
                'preview_image' => '/images/templates/pro.jpg',
                'template_type' => 'hosted',
                'base_price' => 199.99,
                'monthly_price' => 49.99,
                'setup_fee' => 49.99,
                'features' => [
                    'Design premium',
                    'Analytics avancées',
                    'API complète',
                    'Multi-utilisateurs',
                    'Automatisations',
                ],
                'files_path' => null,
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        WhiteLabelTemplate::firstOrCreate(
            ['slug' => 'api-only'],
            [
                'name' => 'API Only',
                'description' => 'Solution API uniquement sans interface',
                'preview_image' => '/images/templates/api.jpg',
                'template_type' => 'api_only',
                'base_price' => 49.99,
                'monthly_price' => 9.99,
                'setup_fee' => 0.00,
                'features' => [
                    'API complète',
                    'Documentation',
                    'Support technique',
                    'High availability',
                ],
                'files_path' => null,
                'is_active' => true,
                'sort_order' => 3,
            ]
        );
    }
}
