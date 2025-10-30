<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('emergencias', function (Blueprint $table) {
            $table->foreignId('clinica_id')->nullable()->constrained('clinicas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('emergencias', function (Blueprint $table) {
            $table->dropForeign(['clinica_id']);
            $table->dropColumn('clinica_id');
        });
    }
};
