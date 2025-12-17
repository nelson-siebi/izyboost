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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->comment('Utilisateur ayant fait l\'action');
            
            // Action
            $table->string('action', 100)->comment('user.created, order.placed, etc.');
            $table->string('model_type')->nullable()->comment('Modèle concerné');
            $table->unsignedBigInteger('model_id')->nullable()->comment('ID modèle');
            
            // Changements
            $table->json('old_values')->nullable()->comment('Valeurs avant');
            $table->json('new_values')->nullable()->comment('Valeurs après');
            
            // Métadonnées
            $table->string('ip_address', 45)->comment('IP');
            $table->text('user_agent')->nullable()->comment('User agent');
            $table->json('location')->nullable()->comment('Données géo IP');
            $table->json('tags')->nullable()->comment('Tags classification');
            $table->timestamp('created_at')->nullable();
            
            // Index
            $table->index('user_id');
            $table->index('action');
            $table->index(['model_type', 'model_id']);
            $table->index('created_at');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
