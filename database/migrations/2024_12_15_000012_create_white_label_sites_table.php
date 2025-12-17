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
        Schema::create('white_label_sites', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            
            // Propriétaire
            $table->foreignId('owner_id')->comment('Propriétaire');
            
            // Configuration
            $table->foreignId('template_id')->comment('Template utilisé');
            $table->foreignId('plan_id')->comment('Plan actuel');
            
            // Informations site
            $table->string('site_name', 200)->comment('Nom site');
            $table->string('site_url', 500)->comment('URL principale');
            $table->string('subdomain', 100)->unique()->nullable()->comment('Sous-domaine client.votresite.com');
            $table->string('custom_domain')->unique()->nullable()->comment('Domaine personnalisé');
            
            // Statut
            $table->enum('status', ['draft', 'pending', 'active', 'suspended', 'expired', 'cancelled'])->default('draft');
            
            // Déploiement
            $table->enum('deployment_type', ['self_hosted', 'hosted_by_us', 'cloud_hosted'])->default('self_hosted');
            $table->json('hosting_details')->nullable()->comment('{provider: "netlify", url: "...", credentials: {...}}');
            
            // Branding
            $table->json('branding')->comment('{logo: "...", colors: {...}, favicon: "...", name: "..."}');
            
            // Configuration
            $table->json('configuration')->comment('Toute la config');
            $table->json('allowed_services')->nullable()->comment('Services autorisés');
            
            // Prix
            $table->decimal('price_multiplier', 5, 2)->default(1.00)->comment('Coefficient prix');
            $table->decimal('margin_percent', 5, 2)->default(20.00)->comment('Marge revendeur %');
            
            // Statistiques
            $table->json('statistics')->comment('Stats site');
            
            // Dates importantes
            $table->timestamp('last_payment_at')->nullable()->comment('Dernier paiement');
            $table->timestamp('next_payment_at')->nullable()->comment('Prochain paiement');
            $table->timestamp('expires_at')->nullable()->comment('Date expiration');
            $table->timestamp('suspended_at')->nullable()->comment('Date suspension');
            $table->timestamp('cancellation_requested_at')->nullable()->comment('Date demande annulation');
            
            // Notes
            $table->text('notes')->nullable()->comment('Notes admin');
            $table->timestamps();
            
            // Index
            $table->index('owner_id');
            $table->index('status');
            $table->index('template_id');
            $table->index('plan_id');
            
            // Foreign keys
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('white_label_templates')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('white_label_plans')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('white_label_sites');
    }
};
