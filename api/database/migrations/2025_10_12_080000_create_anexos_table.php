<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anexos', function (Blueprint $table) {
            $table->id();

            // Campos polimórficos
            $table->unsignedBigInteger('anexable_id');
            $table->string('anexable_type');

            // Dados do anexo
            $table->string('nome_arquivo');
            $table->string('caminho'); // path ou URL
            $table->string('tipo')->nullable(); // pdf, jpg, png
            $table->integer('tamanho')->nullable(); // bytes

            $table->timestamps();

            $table->index(['anexable_id', 'anexable_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anexos');
    }
};
