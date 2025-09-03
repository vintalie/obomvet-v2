<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('veterinarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nome_completo');
            $table->string('crmv')->unique();
            $table->string('especialidade')->nullable();
            $table->string('telefone_emergencia');
            $table->boolean('disponivel_24h')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('veterinarios');
    }
};