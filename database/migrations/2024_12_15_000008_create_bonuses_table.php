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
        Schema::create('bonuses', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom bonus');
            $table->string('code', 50)->unique()->nullable()->comment('Code promo');
            $table->enum('type', ['deposit', 'registration', 'order', 'referral', 'subscription'])->comment('Type');
            $table->enum('amount_type', ['percentage', 'fixed'])->default('percentage')->comment('Type montant');
            $table->decimal('amount_value', 10, 2)->comment('Valeur (10% ou 10€)');
            
            // Conditions
            $table->decimal('min_required', 10, 2)->nullable()->comment('Minimum requis');
            $table->decimal('max_bonus', 10, 2)->nullable()->comment('Bonus maximum');
            $table->string('currency', 10)->nullable()->comment('Devise applicable');
            
            // Dates
            $table->timestamp('starts_at')->comment('Début');
            $table->timestamp('expires_at')->nullable()->comment('Fin');
            
            // Utilisation
            $table->integer('total_uses')->default(0)->comment('Utilisations totales');
            $table->integer('max_uses')->nullable()->comment('Utilisations max');
            $table->integer('per_user_limit')->nullable()->comment('Limite par utilisateur');
            
            // Statut
            $table->boolean('is_active')->default(true)->comment('Actif');
            
            // Applicabilité
            $table->json('applicable_to')->nullable()->comment('Services/groupes spécifiques');
            $table->timestamps();
            
            // Index
            $table->index('type');
            $table->index('is_active');
            $table->index(['starts_at', 'expires_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonuses');
    }
};
