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
        Schema::create('site_orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->foreignId('user_id')->comment('Client');
            
            // Configuration achetée
            $table->foreignId('template_id')->comment('Template acheté');
            $table->foreignId('plan_id')->comment('Plan acheté');
            
            // Transaction
            $table->foreignId('transaction_id')->nullable()->comment('Transaction paiement');
            
            // Type
            $table->enum('type', ['new_purchase', 'renewal', 'upgrade', 'downgrade'])->default('new_purchase');
            
            // Montants
            $table->decimal('amount', 10, 2)->comment('Montant plan');
            $table->decimal('setup_fee', 10, 2)->default(0)->comment('Frais setup');
            $table->decimal('total_amount', 10, 2)->comment('Total');
            $table->string('currency', 10)->default('EUR');
            
            // Statut
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            
            // Déploiement
            $table->enum('deployment_type', ['self_hosted', 'hosted_by_us', 'cloud_hosted'])->default('self_hosted');
            $table->json('hosting_preferences')->nullable()->comment('Préférences hébergement');
            $table->text('custom_requirements')->nullable()->comment('Exigences personnalisées');
            
            // Livraison
            $table->string('download_link', 500)->nullable()->comment('Lien téléchargement');
            $table->timestamp('download_expires_at')->nullable()->comment('Expiration lien');
            $table->timestamp('deployed_at')->nullable()->comment('Date déploiement');
            $table->timestamp('completed_at')->nullable()->comment('Date complétion');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('status');
            $table->index('template_id');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('white_label_templates')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('white_label_plans')->onDelete('cascade');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_orders');
    }
};
