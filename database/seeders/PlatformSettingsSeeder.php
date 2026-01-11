<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'izyboost', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'site_url', 'value' => 'https://izyboost.nelsius.com', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'site_email', 'value' => 'support@izyboost.com', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'admin_email', 'value' => 'admin@izyboost.com', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => false, 'editable' => true],
            ['key' => 'currency_default', 'value' => 'XAF', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'language_default', 'value' => 'fr', 'type' => 'string', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'registration_enabled', 'value' => 'true', 'type' => 'boolean', 'category' => 'general', 'group' => 'site', 'is_public' => true, 'editable' => true],
            ['key' => 'deposit_min_amount', 'value' => '150', 'type' => 'decimal', 'category' => 'payment', 'group' => 'limits', 'is_public' => true, 'editable' => true],
            ['key' => 'deposit_max_amount', 'value' => '500000', 'type' => 'decimal', 'category' => 'payment', 'group' => 'limits', 'is_public' => true, 'editable' => true],
            ['key' => 'referral_levels', 'value' => '3', 'type' => 'integer', 'category' => 'referral', 'group' => 'commission', 'is_public' => true, 'editable' => true],
            ['key' => 'referral_commission_level_1', 'value' => '10', 'type' => 'decimal', 'category' => 'referral', 'group' => 'commission', 'is_public' => true, 'editable' => true],
            ['key' => 'referral_commission_level_2', 'value' => '5', 'type' => 'decimal', 'category' => 'referral', 'group' => 'commission', 'is_public' => true, 'editable' => true],
            ['key' => 'referral_commission_level_3', 'value' => '2', 'type' => 'decimal', 'category' => 'referral', 'group' => 'commission', 'is_public' => true, 'editable' => true],
            ['key' => 'default_user_margin', 'value' => '30', 'type' => 'decimal', 'category' => 'services', 'group' => 'pricing', 'is_public' => false, 'editable' => true],
            ['key' => 'site_monthly_price', 'value' => '29.99', 'type' => 'decimal', 'category' => 'white_label', 'group' => 'pricing', 'is_public' => true, 'editable' => true],
            ['key' => 'site_setup_fee', 'value' => '49.99', 'type' => 'decimal', 'category' => 'white_label', 'group' => 'pricing', 'is_public' => true, 'editable' => true],
        ];

        foreach ($settings as $setting) {
            DB::table('platform_settings')->updateOrInsert(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
