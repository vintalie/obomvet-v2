<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Models\Tutor;
use Illuminate\Http\Request;

class EmergenciaController extends Controller
{
    /**
     * Criação pública de emergência (sem login)
     */
    public function store(Request $request)
    {
        // Validação básica
        $validated = $request->validate([
            'descricao_sintomas' => 'required|string|max:500',
            'nivel_urgencia' => 'required|string|in:baixa,media,alta,critica',
            'pet_id' => 'nullable|integer|exists:pets,id',
        ]);

        // Procura um tutor anônimo padrão ou cria um se não existir
        $tutorAnonimo = Tutor::firstOrCreate(
            ['cpf' => '00000000000'], // CPF fictício para anônimo
            [
                'nome_completo' => 'Tutor Anônimo',
                'telefone_principal' => '0000000000',
                'telefone_alternativo' => null,
                'usuario_id' => null // nenhum usuário vinculado
            ]
        );

        // Cria a emergência
        $emergencia = Emergencia::create([
            'descricao_sintomas' => $validated['descricao_sintomas'],
            'nivel_urgencia' => strtolower($validated['nivel_urgencia']),
            'pet_id' => $validated['pet_id'] ?? null,
            'tutor_id' => $tutorAnonimo->id,
            'status' => 'aberta', // ⬅️ valor padrão respeitando o CHECK constraint
        ]);

        return response()->json([
            'message' => 'Emergência criada com sucesso!',
            'data' => $emergencia,
        ], 201);
    }
}
