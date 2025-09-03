<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('historico_atendimentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('emergencia_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinario_id')->constrained()->onDelete('cascade');
            $table->text('acao_realizada');
            $table->timestamp('data_acao')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('historico_atendimentos');
    }
};