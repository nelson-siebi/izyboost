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
        Schema::create('service_prices_override', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->comment('Service');
            $table->foreignId('user_id')->nullable()->comment('Utilisateur spécifique');
            $table->foreignId('white_label_site_id')->nullable()->comment('Site spécifique');
            $table->decimal('custom_price', 12, 6)->comment('Prix personnalisé');
            $table->decimal('custom_margin_percent', 5, 2)->nullable()->comment('Marge personnalisée %');
            $table->boolean('is_active')->default(true)->comment('Actif');
            $table->timestamp('starts_at')->nullable()->comment('Début validité');
            $table->timestamp('expires_at')->nullable()->comment('Fin validité');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['service_id', 'user_id', 'white_label_site_id'], 'service_prices_override_unique');
            
            // Index
            $table->index('service_id');
            $table->index('user_id');
            $table->index('white_label_site_id');
            $table->index('is_active');
            
            // Foreign keys
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('white_label_site_id')->references('id')->on('white_label_sites')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_prices_override');
    }
};
