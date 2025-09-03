<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('emergencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('tutor_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinario_id')->nullable()->constrained()->onDelete('set null');
            $table->text('descricao_sintomas');
            $table->enum('nivel_urgencia', ['baixa', 'media', 'alta', 'critica'])->default('media');
            $table->enum('status', ['aberta', 'em_atendimento', 'concluida', 'cancelada'])->default('aberta');
            $table->timestamp('data_abertura')->useCurrent();
            $table->timestamp('data_conclusao')->nullable();
            $table->text('diagnostico')->nullable();
            $table->text('prescricao_medica')->nullable();
            $table->decimal('custo_estimado', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('emergencias');
    }
};