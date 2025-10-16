<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use Illuminate\Http\Request;

class EmergenciaController extends Controller
{
    /**
     * Criação pública de emergência (sem login)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'descricao_sintomas' => 'required|string|max:500',
            'nivel_urgencia' => 'required|string|in:baixa,media,alta,critica',
            'pet_id' => 'nullable|integer|exists:pets,id',
        ]);

        $emergencia = Emergencia::create([
            'descricao_sintomas' => $validated['descricao_sintomas'],
            'nivel_urgencia' => $validated['nivel_urgencia'],
            'pet_id' => $validated['pet_id'] ?? null,
            'status' => 'pendente',
        ]);

        return response()->json([
            'message' => 'Emergência criada com sucesso!',
            'data' => $emergencia,
        ], 201);
    }
}
