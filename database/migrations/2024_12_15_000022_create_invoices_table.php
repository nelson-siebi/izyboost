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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique()->comment('UUID public');
            $table->string('invoice_number', 50)->unique()->comment('Numéro facture');
            $table->foreignId('user_id')->comment('Client');
            
            // Références
            $table->foreignId('transaction_id')->nullable()->comment('Transaction associée');
            $table->foreignId('subscription_id')->nullable()->comment('Abonnement associé');
            
            // Type
            $table->enum('type', ['deposit', 'order', 'subscription', 'site_purchase', 'custom']);
            
            // Montants
            $table->decimal('amount', 15, 6)->comment('Montant HT');
            $table->decimal('tax_rate', 5, 2)->default(0)->comment('Taux TVA %');
            $table->decimal('tax_amount', 15, 6)->default(0)->comment('Montant TVA');
            $table->decimal('total_amount', 15, 6)->comment('Total TTC');
            $table->string('currency', 10)->default('EUR');
            
            // Statut
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            
            // Dates
            $table->date('due_date')->comment('Date échéance');
            $table->timestamp('paid_at')->nullable()->comment('Date paiement');
            
            // Informations
            $table->json('billing_info')->comment('Infos facturation');
            $table->json('items')->comment('Articles facture');
            $table->text('notes')->nullable()->comment('Notes');
            
            // Fichier
            $table->string('pdf_path', 500)->nullable()->comment('Chemin PDF');
            $table->timestamp('sent_at')->nullable()->comment('Date envoi');
            $table->timestamps();
            
            // Index
            $table->index('user_id');
            $table->index('status');
            $table->index('due_date');
            
            // Foreign keys
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
