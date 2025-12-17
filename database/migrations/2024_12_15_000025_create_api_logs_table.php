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
        Schema::create('api_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('api_key_id')->nullable()->comment('Clé API utilisée');
            $table->foreignId('user_id')->nullable()->comment('Utilisateur');
            
            // Requête
            $table->string('method', 10)->comment('GET, POST, etc.');
            $table->string('endpoint', 500)->comment('Endpoint appelé');
            $table->json('request_headers')->nullable()->comment('Headers requête');
            $table->json('request_body')->nullable()->comment('Body requête');
            
            // Réponse
            $table->integer('response_code')->comment('Code HTTP réponse');
            $table->json('response_body')->nullable()->comment('Body réponse');
            
            // Métadonnées
            $table->string('ip_address', 45)->comment('IP appelant');
            $table->text('user_agent')->nullable()->comment('User agent');
            $table->integer('duration_ms')->comment('Durée requête ms');
            $table->timestamp('created_at')->nullable();
            
            // Index
            $table->index('api_key_id');
            $table->index('user_id');
            $table->index('endpoint');
            $table->index('response_code');
            $table->index('created_at');
            
            // Foreign keys
            $table->foreign('api_key_id')->references('id')->on('api_keys')->onDelete('set null');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('api_logs');
    }
};
