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
        Schema::create('white_label_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom plan');
            $table->string('slug', 100)->unique()->comment('Slug');
            $table->text('description')->nullable()->comment('Description');
            
            // Prix
            $table->decimal('monthly_price', 10, 2)->comment('Prix mensuel');
            $table->decimal('yearly_price', 10, 2)->nullable()->comment('Prix annuel (-20%)');
            $table->decimal('setup_fee', 10, 2)->default(0.00)->comment('Frais setup');
            $table->decimal('transaction_fee_percent', 5, 2)->default(5.00)->comment('% commission');
            
            // Fonctionnalités et limites
            $table->json('features')->comment('[{name: "API", enabled: true}, ...]');
            $table->json('limits')->comment('{max_users: 100, max_orders: 1000}');
            
            // Statut
            $table->boolean('is_active')->default(true)->comment('Actif');
            $table->boolean('is_featured')->default(false)->comment('En vedette');
            $table->integer('sort_order')->default(0)->comment('Ordre affichage');
            $table->timestamps();
            
            // Index
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('white_label_plans');
    }
};
