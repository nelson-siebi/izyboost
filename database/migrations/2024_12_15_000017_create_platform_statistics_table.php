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
        Schema::create('platform_statistics', function (Blueprint $table) {
            $table->id();
            $table->date('period')->unique()->comment('Date stats');
            
            // Utilisateurs
            $table->integer('total_users')->default(0)->comment('Total utilisateurs');
            $table->integer('new_users')->default(0)->comment('Nouveaux utilisateurs');
            $table->integer('active_users')->default(0)->comment('Utilisateurs actifs');
            
            // Commandes
            $table->integer('total_orders')->default(0)->comment('Commandes totales');
            $table->decimal('total_revenue', 15, 6)->default(0)->comment('Chiffre d\'affaires');
            $table->decimal('total_profit', 15, 6)->default(0)->comment('Bénéfice net');
            
            // Transactions
            $table->decimal('total_deposits', 15, 6)->default(0)->comment('Total dépôts');
            $table->decimal('total_withdrawals', 15, 6)->default(0)->comment('Total retraits');
            
            // Sites
            $table->integer('total_sites')->default(0)->comment('Sites créés');
            $table->integer('total_subscriptions')->default(0)->comment('Abonnements actifs');
            
            // Performance
            $table->decimal('conversion_rate', 5, 2)->default(0)->comment('Taux conversion %');
            $table->timestamps();
            
            // Index
            $table->index('period');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_statistics');
    }
};
