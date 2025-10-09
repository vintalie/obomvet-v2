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
        Schema::table('veterinarios', function (Blueprint $table) {
            $table->foreignId('clinica_id')->nullable()->constrained('clinicas')->nullOnDelete();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('veterinarios', function (Blueprint $table) {
            $table->dropForeign(['clinica_id']);
            $table->dropColumn('clinica_id');
        });
    }

};
