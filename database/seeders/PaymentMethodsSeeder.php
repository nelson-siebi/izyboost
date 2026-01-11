<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PaymentMethod;

class PaymentMethodsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Orange Money (Cameroun)
        PaymentMethod::updateOrCreate(
            ['code' => 'orange_money'],
            [
                'name' => 'Orange Money',
                'type' => 'mobile_money',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/240px-Orange_logo.svg.png',
                'min_amount' => 100,
                'max_amount' => 1000000,
                'currencies' => ['XAF'],
                'countries' => ['CM'],
                'is_active' => true,
                'config' => [],
                'sort_order' => 1
            ]
        );

        // 2. MTN Money (Cameroun)
        PaymentMethod::updateOrCreate(
            ['code' => 'mtn_money'],
            [
                'name' => 'MTN Money',
                'type' => 'mobile_money',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/MTN_Logo.svg/1024px-MTN_Logo.svg.png',
                'min_amount' => 100,
                'max_amount' => 1000000,
                'currencies' => ['XAF'],
                'countries' => ['CM'],
                'is_active' => true,
                'config' => [],
                'sort_order' => 2
            ]
        );

        // 3. Paiement International (Tout Pays)
        PaymentMethod::updateOrCreate(
            ['code' => 'global_unified'],
            [
                'name' => 'MTN/OM/Visa / MasterCard / PayPal / Autres',
                'type' => 'card', // Redirection
                'logo' => 'https://static.thenounproject.com/png/2290120-200.png', // More generic cards icon
                'min_amount' => 100,
                'max_amount' => 10000000,
                'currencies' => ['XAF', 'XOF', 'EUR', 'USD'],
                'countries' => [],
                'is_active' => true,
                'config' => [],
                'sort_order' => 3
            ]
        );

        // Supprimer les résidus
        PaymentMethod::whereNotIn('code', ['orange_money', 'mtn_money', 'global_unified'])->delete();
    }
}
