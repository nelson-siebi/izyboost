<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('payment_methods')->insert([
            [
                'name' => 'Orange Money',
                'code' => 'orange_money',
                'logo' => 'https://api.nelsius.com/logos/orange.png',
                'type' => 'mobile_money',
                'min_amount' => 100,
                'max_amount' => 500000,
                'currencies' => json_encode(['XAF']),
                'countries' => json_encode(['CM']),
                'is_active' => true,
                'config' => json_encode([]),
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'MTN MoMo',
                'code' => 'mtn_money',
                'logo' => 'https://api.nelsius.com/logos/mtn.png',
                'type' => 'mobile_money',
                'min_amount' => 100,
                'max_amount' => 500000,
                'currencies' => json_encode(['XAF']),
                'countries' => json_encode(['CM']),
                'is_active' => true,
                'config' => json_encode([]),
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        DB::table('payment_methods')->whereIn('code', ['orange_money', 'mtn_money'])->delete();
    }
};
