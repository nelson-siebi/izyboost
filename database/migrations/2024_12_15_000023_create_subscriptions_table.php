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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->foreignId('user_id')->comment('Utilisateur');
            
            // Site associé (si abonnement site)
            $table->foreignId('white_label_site_id')->nullable()->comment('Site abonné');
            
            // Plan
            $table->foreignId('plan_id')->comment('Plan');
            $table->foreignId('template_id')->nullable()->comment('Template (si site)');
            
            // Statut
            $table->enum('status', ['active', 'pending', 'cancelled', 'expired', 'suspended'])->default('pending');
            
            // Montant
            $table->decimal('amount', 10, 2)->comment('Montant');
            $table->string('currency', 10)->default('EUR');
            $table->enum('interval', ['monthly', 'yearly', 'lifetime'])->default('monthly');
            
            // Dates
            $table->timestamp('starts_at')->nullable()->comment('Début');
            $table->timestamp('ends_at')->nullable()->comment('Fin');
            $table->timestamp('trial_ends_at')->nullable()->comment('Fin période essai');
            $table->timestamp('cancelled_at')->nullable()->comment('Date annulation');
            
            // Paiement
            $table->string('payment_method', 50)->nullable()->comment('Méthode paiement');
            $table->string('gateway_subscription_id')->nullable()->comment('ID abonnement gateway');
            
            // Métadonnées
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('status');
            $table->index('white_label_site_id');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('white_label_site_id')->references('id')->on('white_label_sites')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('white_label_plans')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('white_label_templates')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
