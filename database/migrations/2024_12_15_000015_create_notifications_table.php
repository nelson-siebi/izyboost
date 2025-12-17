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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID');
            $table->foreignId('user_id')->comment('Destinataire');
            
            // Contenu
            $table->enum('type', ['info', 'warning', 'success', 'error', 'system'])->default('info');
            $table->string('title')->comment('Titre');
            $table->text('message')->comment('Message');
            $table->json('data')->nullable()->comment('Données supplémentaires');
            
            // Action
            $table->string('icon', 50)->nullable()->comment('Icône');
            $table->string('action_url', 500)->nullable()->comment('URL action');
            $table->string('action_label', 100)->nullable()->comment('Label bouton');
            
            // Statut
            $table->boolean('is_read')->default(false)->comment('Lu');
            $table->timestamp('expires_at')->nullable()->comment('Expiration');
            $table->timestamp('read_at')->nullable()->comment('Date lecture');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('type');
            $table->index('is_read');
            $table->index('created_at');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
