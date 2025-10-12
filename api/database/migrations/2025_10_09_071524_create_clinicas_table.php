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
        Schema::create('clinicas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained()->onDelete('cascade');
            $table->string('nome_fantasia');
            $table->string('razao_social')->nullable();
            $table->string('cnpj')->unique()->nullable();
            $table->string('endereco')->nullable();
            $table->string('telefone_principal')->nullable();
            $table->string('telefone_emergencia')->nullable();
            $table->string('email_contato')->nullable();
            $table->string('horario_funcionamento')->nullable();
            $table->boolean('disponivel_24h')->default(false);
            $table->string('localizacao')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinicas');
    }
};
