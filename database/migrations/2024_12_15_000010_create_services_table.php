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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->comment('Catégorie parente');
            $table->foreignId('api_provider_id')->comment('Fournisseur');
            $table->string('external_id', 100)->comment('ID chez fournisseur');
            $table->string('name')->comment('Nom service');
            $table->text('description')->nullable()->comment('Description');
            $table->enum('type', ['default', 'custom_comments', 'package'])->default('default')->comment('Type service');
            
            // Quantités
            $table->integer('min_quantity')->default(1)->comment('Minimum');
            $table->integer('max_quantity')->default(10000)->comment('Maximum');
            
            // Prix
            $table->decimal('cost_per_unit', 12, 6)->comment('Coût chez fournisseur');
            $table->decimal('base_price_per_unit', 12, 6)->comment('Prix de base');
            $table->decimal('user_margin_percent', 5, 2)->default(30.00)->comment('Marge utilisateur %');
            
            // Configuration fournisseur
            $table->string('provider', 100)->comment('Nom fournisseur');
            $table->json('provider_config')->nullable()->comment('Config spécifique');
            
            // Détails livraison
            $table->string('average_time', 50)->nullable()->comment('Temps moyen livraison');
            $table->integer('quality_score')->default(5)->comment('Score qualité 1-10');
            $table->boolean('drip_feed')->default(false)->comment('Livraison échelonnée');
            $table->integer('refill_guarantee_days')->nullable()->comment('Jours garantie rechargement');
            
            // Statut
            $table->boolean('is_active')->default(true)->comment('Actif');
            $table->boolean('is_featured')->default(false)->comment('En vedette');
            $table->integer('sort_order')->default(0)->comment('Ordre tri');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['api_provider_id', 'external_id']);
            
            // Index
            $table->index('category_id');
            $table->index('api_provider_id');
            $table->index('type');
            $table->index('is_active');
            $table->index('sort_order');
            
            // Foreign keys
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
            $table->foreign('api_provider_id')->references('id')->on('api_providers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
