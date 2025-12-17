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
        Schema::create('user_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->comment('Utilisateur');
            $table->date('period')->comment('Date des stats');
            
            // Commandes
            $table->integer('total_orders')->default(0)->comment('Commandes totales');
            $table->decimal('total_spent', 15, 6)->default(0)->comment('Total dépensé');
            
            // Gains
            $table->decimal('total_earned', 15, 6)->default(0)->comment('Total gagné');
            
            // Transactions
            $table->integer('total_deposits')->default(0)->comment('Dépôts');
            $table->integer('total_withdrawals')->default(0)->comment('Retraits');
            
            // Parrainage
            $table->integer('referral_count')->default(0)->comment('Nombre filleuls');
            $table->decimal('referral_earnings', 15, 6)->default(0)->comment('Gains parrainage');
            
            // Sites
            $table->integer('site_count')->default(0)->comment('Sites créés');
            $table->integer('subscription_count')->default(0)->comment('Abonnements actifs');
            
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['user_id', 'period']);
            
            // Index
            $table->index('user_id');
            $table->index('period');
            
            // Foreign key
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_statistics');
    }
};
