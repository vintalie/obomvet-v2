<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('emergencias', function (Blueprint $table) {
            $table->enum('visita_tipo', ['domicilio', 'clinica'])->nullable()->after('descricao_sintomas');
        });

    }

    public function down()
    {
        Schema::table('emergencias', function (Blueprint $table) {
            $table->dropColumn('visita_tipo');
        });
    }
};
