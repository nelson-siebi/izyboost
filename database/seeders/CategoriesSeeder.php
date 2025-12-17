<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'TikTok', 'slug' => 'tiktok', 'icon' => 'fab fa-tiktok', 'description' => 'Services pour TikTok', 'position' => 1, 'is_active' => true],
            ['name' => 'Instagram', 'slug' => 'instagram', 'icon' => 'fab fa-instagram', 'description' => 'Services pour Instagram', 'position' => 2, 'is_active' => true],
            ['name' => 'Facebook', 'slug' => 'facebook', 'icon' => 'fab fa-facebook', 'description' => 'Services pour Facebook', 'position' => 3, 'is_active' => true],
            ['name' => 'YouTube', 'slug' => 'youtube', 'icon' => 'fab fa-youtube', 'description' => 'Services pour YouTube', 'position' => 4, 'is_active' => true],
            ['name' => 'Twitter/X', 'slug' => 'twitter', 'icon' => 'fab fa-x-twitter', 'description' => 'Services pour Twitter/X', 'position' => 5, 'is_active' => true],
            ['name' => 'Telegram', 'slug' => 'telegram', 'icon' => 'fab fa-telegram', 'description' => 'Services pour Telegram', 'position' => 6, 'is_active' => true],
            ['name' => 'Spotify', 'slug' => 'spotify', 'icon' => 'fab fa-spotify', 'description' => 'Services pour Spotify', 'position' => 7, 'is_active' => true],
            ['name' => 'Autres', 'slug' => 'autres', 'icon' => 'fas fa-globe', 'description' => 'Autres services', 'position' => 8, 'is_active' => true],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                array_merge($category, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
