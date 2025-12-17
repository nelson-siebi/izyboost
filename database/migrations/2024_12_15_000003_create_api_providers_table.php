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
        Schema::create('api_providers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom fournisseur');
            $table->string('code', 50)->unique()->comment('Code interne');
            $table->text('base_url')->comment('URL API');
            
            // Authentification
            $table->text('api_key')->comment('Clé API (chiffrée)');
            $table->text('api_secret')->nullable()->comment('Secret (chiffré)');
            
            // Solde
            $table->decimal('balance', 15, 6)->default(0)->comment('Solde chez fournisseur');
            $table->string('currency', 10)->default('USD');
            
            // Performance
            $table->enum('status', ['active', 'inactive', 'testing'])->default('active');
            $table->integer('priority')->default(1)->comment('Priorité (1=premier choix)');
            $table->decimal('success_rate', 5, 2)->default(100.00)->comment('Taux réussite %');
            $table->integer('response_time_ms')->nullable()->comment('Temps réponse moyen ms');
            $table->timestamp('last_checked_at')->nullable()->comment('Dernier check');
            
            // Configuration
            $table->json('config')->nullable()->comment('Config spécifique');
            $table->timestamps();
            
            // Index
            $table->index('status');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_providers');
    }
};
