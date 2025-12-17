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
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom frais');
            $table->enum('type', ['deposit', 'withdrawal', 'order', 'subscription', 'site_purchase'])->comment('Type frais');
            $table->enum('calculation_type', ['percentage', 'fixed', 'tiered'])->default('percentage')->comment('Mode calcul');
            
            // Valeurs
            $table->decimal('percentage_value', 5, 2)->nullable()->comment('% si pourcentage');
            $table->decimal('fixed_value', 10, 4)->nullable()->comment('Montant fixe');
            $table->json('tiered_rates')->nullable()->comment('[{min:0, max:100, rate:5}, ...]');
            
            // Limites
            $table->decimal('min_amount', 10, 4)->nullable()->comment('Minimum');
            $table->decimal('max_amount', 10, 4)->nullable()->comment('Maximum');
            $table->string('currency', 10)->default('EUR');
            
            // Statut
            $table->boolean('is_active')->default(true);
            $table->json('applies_to')->nullable()->comment('Méthodes paiement spécifiques');
            $table->foreignId('created_by')->nullable()->comment('Créé par admin');
            $table->timestamps();
            
            // Index
            $table->index('type');
            $table->index('is_active');
            
            // Foreign key
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
