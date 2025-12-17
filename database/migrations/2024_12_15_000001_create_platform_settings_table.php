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
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique()->comment('Clé paramètre');
            $table->text('value')->comment('Valeur');
            $table->enum('type', ['string', 'integer', 'decimal', 'boolean', 'json', 'array'])->default('string')->comment('Type valeur');
            $table->string('category', 50)->comment('Catégorie');
            $table->string('group', 50)->comment('Groupe');
            $table->boolean('is_public')->default(false)->comment('Public ou admin seulement');
            $table->boolean('editable')->default(true)->comment('Modifiable via admin');
            $table->timestamps();
            
            // Index
            $table->index('category');
            $table->index('group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
