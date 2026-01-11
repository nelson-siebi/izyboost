<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            ['key' => 'whatsapp_number', 'value' => '+237695345715', 'type' => 'string', 'category' => 'general', 'group' => 'social', 'is_public' => true, 'editable' => true],
            ['key' => 'tiktok_link', 'value' => 'https://tiktok.com/@izyboost', 'type' => 'string', 'category' => 'general', 'group' => 'social', 'is_public' => true, 'editable' => true],
            ['key' => 'telegram_link', 'value' => 'https://t.me/izyboost', 'type' => 'string', 'category' => 'general', 'group' => 'social', 'is_public' => true, 'editable' => true],
            ['key' => 'facebook_link', 'value' => 'https://facebook.com/izyboost', 'type' => 'string', 'category' => 'general', 'group' => 'social', 'is_public' => true, 'editable' => true],
            ['key' => 'youtube_link', 'value' => 'https://youtube.com/@izyboost', 'type' => 'string', 'category' => 'general', 'group' => 'social', 'is_public' => true, 'editable' => true],
        ];

        foreach ($settings as $setting) {
            \App\Models\PlatformSetting::updateOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $keys = ['whatsapp_number', 'tiktok_link', 'telegram_link', 'facebook_link', 'youtube_link'];
        \App\Models\PlatformSetting::whereIn('key', $keys)->delete();
    }
};
