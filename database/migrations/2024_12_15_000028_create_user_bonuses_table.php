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
        Schema::create('user_bonuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Utilisateur');
            $table->foreignId('bonus_id')->comment('Bonus');
            
            // Origine
            $table->foreignId('transaction_id')->nullable()->comment('Transaction associée');
            $table->foreignId('order_id')->nullable()->comment('Commande associée');
            
            // Montant
            $table->decimal('amount', 15, 6)->comment('Montant bonus');
            
            // Statut
            $table->enum('status', ['pending', 'active', 'used', 'expired'])->default('pending');
            
            // Dates
            $table->timestamp('expires_at')->nullable()->comment('Expiration');
            $table->timestamp('used_at')->nullable()->comment('Date utilisation');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'bonus_id', 'transaction_id', 'order_id'], 'user_bonuses_unique');
            
            // Index
            $table->index('user_id');
            $table->index('status');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('bonus_id')->references('id')->on('bonuses')->onDelete('cascade');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
            $table->foreign('order_id')->references('id')->on('orders')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_bonuses');
    }
};
