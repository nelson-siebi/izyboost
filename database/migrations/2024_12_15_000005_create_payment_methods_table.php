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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->comment('Nom méthode');
            $table->string('code', 50)->unique()->comment('Code interne');
            $table->string('logo', 500)->nullable()->comment('URL logo');
            $table->enum('type', ['card', 'crypto', 'bank_transfer', 'ewallet', 'mobile_money'])->comment('Type');
            
            // Frais
            $table->foreignId('fee_structure_id')->nullable()->comment('Structure frais');
            
            // Limites
            $table->decimal('min_amount', 12, 4)->default(1.0000)->comment('Minimum');
            $table->decimal('max_amount', 12, 4)->nullable()->comment('Maximum');
            
            // Configuration
            $table->json('currencies')->comment('Devises acceptées');
            $table->json('countries')->nullable()->comment('Pays acceptés');
            $table->boolean('is_active')->default(true)->comment('Active');
            $table->boolean('require_kyc')->default(false)->comment('KYC requis');
            $table->json('config')->comment('Configuration (chiffrée)');
            $table->integer('sort_order')->default(0)->comment('Ordre affichage');
            $table->timestamps();
            
            // Index
            $table->index('type');
            $table->index('is_active');
            $table->index('sort_order');
            
            // Foreign key
            $table->foreign('fee_structure_id')->references('id')->on('fee_structures')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
