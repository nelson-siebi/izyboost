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
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->comment('Ticket parent');
            $table->foreignId('user_id')->comment('Auteur');
            $table->text('message')->comment('Contenu message');
            $table->json('attachments')->nullable()->comment('Fichiers joints');
            $table->boolean('is_internal')->default(false)->comment('Message interne staff');
            $table->timestamp('read_at')->nullable()->comment('Date lecture');
            $table->timestamps();
            
            // Index
            $table->index('ticket_id');
            $table->index('user_id');
            $table->index('created_at');
            
            // Foreign keys
            $table->foreign('ticket_id')->references('id')->on('tickets')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
