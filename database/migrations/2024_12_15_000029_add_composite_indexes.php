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
        // Add composite indexes for better query performance
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'orders_user_status_index');
        });
        
        Schema::table('transactions', function (Blueprint $table) {
            $table->index(['user_id', 'type', 'status'], 'transactions_user_type_status_index');
        });
        
        Schema::table('services', function (Blueprint $table) {
            $table->index(['category_id', 'is_active'], 'services_category_active_index');
        });
        
        Schema::table('white_label_sites', function (Blueprint $table) {
            $table->index(['owner_id', 'status'], 'white_label_sites_owner_status_index');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->index(['sponsor_id', 'is_active'], 'users_sponsor_active_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_user_status_index');
        });
        
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_user_type_status_index');
        });
        
        Schema::table('services', function (Blueprint $table) {
            $table->dropIndex('services_category_active_index');
        });
        
        Schema::table('white_label_sites', function (Blueprint $table) {
            $table->dropIndex('white_label_sites_owner_status_index');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_sponsor_active_index');
        });
    }
};
