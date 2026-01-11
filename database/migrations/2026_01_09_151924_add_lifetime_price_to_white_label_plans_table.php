<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('white_label_plans', function (Blueprint $table) {
            $table->decimal('lifetime_price', 10, 2)->nullable()->after('yearly_price')->comment('Prix à vie');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('white_label_plans', function (Blueprint $table) {
            $table->dropColumn('lifetime_price');
        });
    }
};
