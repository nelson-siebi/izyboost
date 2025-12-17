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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->foreignId('user_id')->comment('Client');
            $table->foreignId('service_id')->comment('Service commandé');
            
            // Origine commande
            $table->foreignId('white_label_site_id')->nullable()->comment('Si via site white-label');
            $table->foreignId('api_key_id')->nullable()->comment('Si via API');
            
            // ID externes
            $table->string('external_order_id', 100)->nullable()->comment('ID chez fournisseur');
            $table->foreignId('external_provider_id')->nullable()->comment('Fournisseur utilisé');
            
            // Détails commande
            $table->text('link')->comment('URL cible');
            $table->integer('quantity')->comment('Quantité');
            
            // Prix et coûts
            $table->decimal('cost_price', 15, 6)->comment('Coût fournisseur');
            $table->decimal('sell_price', 15, 6)->comment('Prix client');
            $table->decimal('margin_amount', 15, 6)->comment('Marge réalisée');
            $table->decimal('commission_amount', 15, 6)->default(0)->comment('Commission parrainage');
            $table->decimal('fees_amount', 15, 6)->default(0)->comment('Frais');
            $table->decimal('net_amount', 15, 6)->comment('Net pour plateforme');
            $table->string('currency', 10)->default('EUR');
            
            // Statut
            $table->enum('status', ['pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'refunded', 'failed'])->default('pending');
            
            // Suivi livraison
            $table->integer('start_count')->nullable()->comment('Compteur début');
            $table->integer('remains')->nullable()->comment('Reste à livrer');
            $table->integer('progress_percentage')->default(0)->comment('Progression %');
            
            // Données personnalisées
            $table->json('custom_data')->nullable()->comment('Commentaires personnalisés, etc.');
            
            // Métadonnées
            $table->text('admin_notes')->nullable()->comment('Notes admin');
            $table->string('ip_address', 45)->nullable()->comment('IP commande');
            $table->text('user_agent')->nullable()->comment('User agent');
            $table->enum('placed_via', ['website', 'api', 'reseller_site', 'mobile'])->default('website')->comment('Source');
            
            // Dates importantes
            $table->timestamp('completed_at')->nullable()->comment('Date complétion');
            $table->timestamp('refilled_at')->nullable()->comment('Date rechargement');
            $table->timestamp('cancelled_at')->nullable()->comment('Date annulation');
            $table->timestamp('refunded_at')->nullable()->comment('Date remboursement');
            $table->timestamps();
            
            // Unique constraint
            $table->unique(['external_provider_id', 'external_order_id']);
            
            // Index
            $table->index('user_id');
            $table->index('service_id');
            $table->index('status');
            $table->index('white_label_site_id');
            $table->index('created_at');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->foreign('white_label_site_id')->references('id')->on('white_label_sites')->onDelete('set null');
            $table->foreign('external_provider_id')->references('id')->on('api_providers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
