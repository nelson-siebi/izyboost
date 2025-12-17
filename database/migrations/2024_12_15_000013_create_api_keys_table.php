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
        Schema::create('api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Propriétaire');
            
            // Identification
            $table->string('name', 100)->comment('Nom clé (ex: "Site web")');
            $table->string('key', 64)->unique()->comment('Clé API publique');
            $table->string('secret', 128)->comment('Secret (chiffré)');
            
            // Permissions
            $table->enum('type', ['public', 'secret'])->default('secret')->comment('Type');
            $table->json('permissions')->comment('Permissions');
            
            // Sécurité
            $table->json('whitelist_ips')->nullable()->comment('IPs autorisées');
            
            // Limites
            $table->integer('rate_limit')->default(100)->comment('Requêtes/minute');
            $table->integer('daily_requests')->default(0)->comment('Requêtes aujourd\'hui');
            
            // Utilisation
            $table->timestamp('last_used_at')->nullable()->comment('Dernière utilisation');
            $table->timestamp('expires_at')->nullable()->comment('Date expiration');
            
            // Statut
            $table->boolean('is_active')->default(true)->comment('Active');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('is_active');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_keys');
    }
};
