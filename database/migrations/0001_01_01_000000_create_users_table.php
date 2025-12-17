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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID unique');
            $table->string('username', 50)->unique()->comment('Nom d\'utilisateur');
            $table->string('email')->unique()->comment('Email');
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // Google Authentication
            $table->string('google_id')->nullable()->comment('Pour auth Google');
            $table->text('google_token')->nullable()->comment('Token Google chiffré');
            
            // Profile
            $table->string('avatar', 500)->nullable()->comment('Photo profil');
            $table->enum('role', ['super_admin', 'admin', 'user'])->default('user')->comment('Rôle simplifié');
            
            // Finances
            $table->decimal('balance', 15, 6)->default(0)->comment('Solde principal');
            $table->decimal('api_balance', 15, 6)->default(0)->comment('Solde API');
            $table->decimal('earnings', 15, 6)->default(0)->comment('Gains parrainage');
            $table->decimal('withdrawable', 15, 6)->default(0)->comment('Retirable');
            
            // Paramètres
            $table->string('currency', 10)->default('EUR');
            $table->string('language', 10)->default('fr');
            $table->string('timezone', 50)->default('Europe/Paris');
            
            // Parrainage
            $table->foreignId('sponsor_id')->nullable()->comment('ID parrain');
            $table->string('sponsor_code', 20)->unique()->nullable()->comment('Code parrainage');
            $table->decimal('commission_rate', 5, 2)->default(10.00)->comment('Commission %');
            
            // Limites
            $table->integer('api_limit_per_minute')->default(100)->comment('Requêtes API/minute');
            $table->integer('max_sites_allowed')->default(3)->comment('Sites max créés');
            
            // Statut
            $table->boolean('is_active')->default(true);
            $table->boolean('is_banned')->default(false);
            $table->boolean('two_factor_enabled')->default(false);
            $table->text('two_factor_secret')->nullable();
            
            // Activité
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            
            // Métadonnées
            $table->json('settings')->nullable()->comment('Préférences');
            
            $table->rememberToken();
            $table->timestamps();
            
            // Index
            $table->index('role');
            $table->index('sponsor_id');
            $table->index('is_active');
            
            // Foreign key
            $table->foreign('sponsor_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
