<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Tutor;
use App\Policies\PetPolicy;
use Illuminate\Http\Request;
use Orion\Http\Controllers\Controller;

class PetController extends Controller
{
    protected $model = Pet::class;
    protected $policy = PetPolicy::class;

    /**
     * Criação pública de pet (sem login)
     */
    public function storePublic(Request $request)
    {
        // Validação básica dos campos
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'especie' => 'nullable|string|max:100',
            'raca' => 'nullable|string|max:100',
            'data_nascimento' => 'nullable|date',
            'peso' => 'nullable|numeric',
            'alergias' => 'nullable|string',
            'medicamentos_continuos' => 'nullable|string',
            'cuidados_especiais' => 'nullable|string',
        ]);

        // Procura ou cria tutor anônimo
        $tutorAnonimo = Tutor::firstOrCreate(
            ['cpf' => '00000000000'],
            [
                'nome_completo' => 'Tutor Anônimo',
                'telefone_principal' => '0000000000',
                'telefone_alternativo' => null,
                'usuario_id' => null,
            ]
        );

        // Cria pet preenchendo valores padrão caso campos não enviados
        $pet = Pet::create(array_merge($validated, [
            'tutor_id' => $tutorAnonimo->id,
            'especie' => $validated['especie'] ?? 'Não Informada',
            'raca' => $validated['raca'] ?? 'Não Informada',
            'data_nascimento' => $validated['data_nascimento'] ?? now(),
            'peso' => $validated['peso'] ?? 0,
            'alergias' => $validated['alergias'] ?? 'Nenhuma',
            'medicamentos_continuos' => $validated['medicamentos_continuos'] ?? 'Nenhum',
            'cuidados_especiais' => $validated['cuidados_especiais'] ?? 'Nenhum',
        ]));

        return response()->json([
            'message' => 'Pet criado com sucesso!',
            'data' => $pet
        ], 201);
    }
}
