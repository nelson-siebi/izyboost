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
            [
                'key' => 'youtube_tutorial_video',
                'value' => 'https://youtube.com',
                'type' => 'string',
                'category' => 'general',
                'group' => 'social',
                'is_public' => true,
                'editable' => true
            ],
            [
                'key' => 'youtube_growth_video',
                'value' => 'https://youtube.com',
                'type' => 'string',
                'category' => 'general',
                'group' => 'social',
                'is_public' => true,
                'editable' => true
            ],
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
        $keys = ['youtube_tutorial_video', 'youtube_growth_video'];
        \App\Models\PlatformSetting::whereIn('key', $keys)->delete();
    }
};
