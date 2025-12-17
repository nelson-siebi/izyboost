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
        Schema::create('referral_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sponsor_id')->comment('Parrain');
            $table->foreignId('referred_id')->comment('Filleul');
            $table->integer('level')->default(1)->comment('Niveau (1,2,3...)');
            $table->decimal('commission_percentage', 5, 2)->comment('% commission niveau');
            $table->enum('status', ['pending', 'active', 'inactive'])->default('active');
            $table->decimal('total_earned', 15, 6)->default(0)->comment('Total gagné');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['sponsor_id', 'referred_id']);
            
            // Index
            $table->index('sponsor_id');
            $table->index('referred_id');
            $table->index('level');
            
            // Foreign keys
            $table->foreign('sponsor_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('referred_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_relationships');
    }
};
