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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom catégorie');
            $table->string('slug', 100)->unique()->comment('Slug URL');
            $table->string('icon', 50)->nullable()->comment('Classe icône (FontAwesome)');
            $table->text('description')->nullable()->comment('Description');
            $table->integer('position')->default(0)->comment('Ordre affichage');
            $table->boolean('is_active')->default(true)->comment('Active');
            $table->timestamps();
            
            // Index
            $table->index('position');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
