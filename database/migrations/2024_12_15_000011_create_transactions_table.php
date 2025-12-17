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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->foreignId('user_id')->comment('Utilisateur');
            $table->foreignId('payment_method_id')->comment('Méthode paiement');
            
            // Type
            $table->enum('type', ['deposit', 'withdrawal', 'order_payment', 'refund', 'commission', 'transfer', 'site_purchase', 'subscription'])->comment('Type transaction');
            $table->string('sub_type', 50)->nullable()->comment('Sous-type');
            
            // Montants
            $table->decimal('amount', 15, 6)->comment('Montant brut');
            $table->decimal('fees', 15, 6)->default(0)->comment('Frais');
            $table->decimal('net_amount', 15, 6)->comment('Montant net');
            $table->string('currency', 10)->default('EUR');
            
            // Statut
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'on_hold', 'refunded'])->default('pending');
            
            // Gateway
            $table->string('gateway', 50)->nullable()->comment('Processeur');
            $table->string('gateway_transaction_id')->nullable()->comment('ID transaction gateway');
            $table->json('gateway_response')->nullable()->comment('Réponse gateway');
            
            // Métadonnées
            $table->string('reference', 100)->nullable()->comment('Référence utilisateur');
            $table->text('description')->nullable()->comment('Description');
            $table->text('admin_notes')->nullable()->comment('Notes admin');
            $table->json('metadata')->nullable()->comment('Métadonnées supplémentaires');
            $table->string('ip_address', 45)->nullable()->comment('IP transaction');
            
            // Vérification
            $table->foreignId('verified_by')->nullable()->comment('Vérifié par admin');
            $table->timestamp('verified_at')->nullable()->comment('Date vérification');
            $table->timestamp('completed_at')->nullable()->comment('Date complétion');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('type');
            $table->index('status');
            $table->index('created_at');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payment_method_id')->references('id')->on('payment_methods')->onDelete('cascade');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
