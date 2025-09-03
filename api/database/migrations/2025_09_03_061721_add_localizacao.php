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
        Schema::table('emergencias', function (Blueprint $table) {
            $table->string('localizacao')->nullable()->after('descricao_sintomas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('emergencias', function (Blueprint $table) {
            $table->dropColumn('localizacao');
        });
    }
};