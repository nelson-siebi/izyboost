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
        Schema::create('white_label_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom template');
            $table->string('slug', 100)->unique()->comment('Slug');
            $table->text('description')->nullable()->comment('Description');
            $table->string('preview_image', 500)->nullable()->comment('Image preview');
            
            // Type déploiement
            $table->enum('template_type', ['full_download', 'hosted', 'api_only'])->default('full_download')->comment('Type');
            
            // Prix
            $table->decimal('base_price', 10, 2)->comment('Prix base');
            $table->decimal('monthly_price', 10, 2)->comment('Prix mensuel');
            $table->decimal('setup_fee', 10, 2)->default(0.00)->comment('Frais setup');
            
            // Fonctionnalités
            $table->json('features')->comment('Fonctionnalités incluses');
            
            // Fichiers
            $table->string('files_path', 500)->nullable()->comment('Chemin fichiers téléchargement');
            
            // Statut
            $table->boolean('is_active')->default(true)->comment('Actif');
            $table->integer('sort_order')->default(0)->comment('Ordre affichage');
            $table->timestamps();
            
            // Index
            $table->index('template_type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('white_label_templates');
    }
};
