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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->foreignId('user_id')->comment('Créateur');
            $table->foreignId('white_label_site_id')->nullable()->comment('Site concerné');
            
            // Attribution
            $table->foreignId('assigned_to')->nullable()->comment('Assigné à (admin)');
            
            // Classification
            $table->enum('department', ['support', 'billing', 'technical', 'sales', 'abuse'])->default('support');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->enum('status', ['open', 'answered', 'closed', 'pending'])->default('open');
            
            // Contenu
            $table->string('subject')->comment('Sujet');
            
            // Dates
            $table->timestamp('last_reply_at')->nullable()->comment('Dernière réponse');
            $table->timestamp('closed_at')->nullable()->comment('Date fermeture');
            $table->foreignId('closed_by')->nullable()->comment('Fermé par');
            
            // Métadonnées
            $table->json('metadata')->nullable()->comment('Métadonnées');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('status');
            $table->index('priority');
            $table->index('department');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('white_label_site_id')->references('id')->on('white_label_sites')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->foreign('closed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
