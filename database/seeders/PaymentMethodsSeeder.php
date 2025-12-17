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
        // 1. Orange Money
        PaymentMethod::firstOrCreate(
            ['code' => 'orange_money'],
            [
                'name' => 'Orange Money',
                'type' => 'mobile_money',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/1200px-Orange_logo.svg.png',
                'min_amount' => 500,
                'max_amount' => 1000000,
                'currencies' => ['XAF', 'XOF'],
                'countries' => ['CM', 'CI', 'SN'],
                'is_active' => true,
                'config' => [],
                'sort_order' => 1
            ]
        );

        // 2. MTN Mobile Money
        PaymentMethod::firstOrCreate(
            ['code' => 'mtn_momo'],
            [
                'name' => 'MTN Mobile Money',
                'type' => 'mobile_money',
                'logo' => 'https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg',
                'min_amount' => 500,
                'max_amount' => 1000000,
                'currencies' => ['XAF', 'XOF'],
                'countries' => ['CM', 'CI', 'GH'],
                'is_active' => true,
                'config' => [],
                'sort_order' => 2
            ]
        );

        // 3. Crypto (USDT)
        PaymentMethod::firstOrCreate(
            ['code' => 'usdt_trc20'],
            [
                'name' => 'USDT (TRC20)',
                'type' => 'crypto',
                'logo' => 'https://cryptologos.cc/logos/tether-usdt-logo.png',
                'min_amount' => 6500, // ~10$
                'max_amount' => 10000000,
                'currencies' => ['USD'],
                'countries' => [],
                'is_active' => true,
                'config' => ['network' => 'TRC20'],
                'sort_order' => 3
            ]
        );
    }
}
