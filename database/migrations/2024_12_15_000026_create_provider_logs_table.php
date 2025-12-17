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
        Schema::create('provider_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->comment('Commande concernée');
            $table->string('provider_name', 100)->comment('Nom fournisseur');
            $table->string('action', 50)->comment('create_order, check_status, etc.');
            
            // Requête
            $table->text('request_url')->comment('URL appelée');
            $table->json('request_payload')->nullable()->comment('Payload envoyé');
            
            // Réponse
            $table->integer('response_code')->comment('Code HTTP');
            $table->json('response_body')->nullable()->comment('Réponse brute');
            $table->text('error_message')->nullable()->comment('Message erreur');
            
            // Performance
            $table->integer('duration_ms')->comment('Durée ms');
            $table->timestamps();
            
            // Index
            $table->index('order_id');
            $table->index('provider_name');
            $table->index('action');
            $table->index('created_at');
            
            // Foreign key
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('provider_logs');
    }
};
