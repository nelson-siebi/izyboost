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
        Schema::create('referral_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_relationship_id')->comment('Relation parente');
            $table->foreignId('user_id')->comment('Qui reçoit');
            $table->foreignId('from_user_id')->comment('De qui vient');
            $table->enum('type', ['registration', 'deposit', 'order', 'subscription', 'site_purchase'])->comment('Type commission');
            
            // Références
            $table->foreignId('order_id')->nullable()->comment('Si commission sur commande');
            $table->foreignId('transaction_id')->nullable()->comment('Si commission sur transaction');
            $table->foreignId('subscription_id')->nullable()->comment('Si commission sur abonnement');
            
            // Montants
            $table->decimal('amount', 15, 6)->comment('Montant commission');
            $table->decimal('percentage', 5, 2)->comment('% appliqué');
            $table->integer('level')->comment('Niveau parrainage');
            
            // Statut
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->timestamp('paid_at')->nullable()->comment('Date paiement');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('from_user_id');
            $table->index('type');
            $table->index('status');
            
            // Foreign keys
            $table->foreign('referral_relationship_id')->references('id')->on('referral_relationships')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('from_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_commissions');
    }
};
