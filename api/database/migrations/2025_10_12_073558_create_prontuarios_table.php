<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prontuarios', function (Blueprint $table) {
            $table->id();
            
            // Relacionamentos
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->foreignId('veterinario_id')->constrained()->onDelete('cascade');
            $table->foreignId('clinica_id')->constrained()->onDelete('cascade');
            $table->foreignId('emergencia_id')->nullable()->constrained()->onDelete('set null');
            
            // Campos do prontuário
            $table->string('tipo_registro'); 
            $table->text('descricao');
            $table->text('diagnostico')->nullable();
            $table->text('prescricao')->nullable();
            $table->timestamp('data_registro')->useCurrent();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prontuarios');
    }
};
