<?php

namespace App\Http\Controllers\Api;

use App\Models\HistoricoAtendimento;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HistoricoAtendimentoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(HistoricoAtendimento::class, 'historico');
    }

    public function index()
    {
        return HistoricoAtendimento::with(['emergencia.pet', 'veterinario'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'emergencia_id' => 'required|exists:emergencias,id',
            'veterinario_id' => 'required|exists:veterinarios,id',
            'acao_realizada' => 'required|string',
            'data_acao' => 'nullable|date',
        ]);

        return HistoricoAtendimento::create($validated);
    }

    public function show(HistoricoAtendimento $historico)
    {
        return $historico->load(['emergencia.pet', 'veterinario']);
    }

    public function update(Request $request, HistoricoAtendimento $historico)
    {
        $historico->update($request->all());
        return $historico;
    }

    public function destroy(HistoricoAtendimento $historico)
    {
        $historico->delete();
        return response()->noContent();
    }

    public function getEmergencia(HistoricoAtendimento $historico)
    {
        return $historico->emergencia()->with('pet')->first();
    }

    public function getAnexo(HistoricoAtendimento $historico)
    {
        return $historico->anexos;
    }

    public function storeAnexo(Request $request, HistoricoAtendimento $historico)
    {
        $request->validate([
            'arquivo' => 'required|file',
            'descricao' => 'required|string'
        ]);

        $path = $request->file('arquivo')->store('anexos', 'public');

        return $historico->anexos()->create([
            'arquivo' => $path,
            'descricao' => $request->descricao
        ]);
    }

    public function meus(Request $request)
{
    try {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Usuário não autenticado'], 401);
        }

        $tutor = \App\Models\Tutor::where('usuario_id', $user->id)->first();

        if (!$tutor) {
            return response()->json(['error' => 'Tutor não encontrado para este usuário'], 404);
        }

        $historicos = HistoricoAtendimento::with(['emergencia.pet', 'veterinario'])
            ->whereHas('emergencia', function ($query) use ($tutor) {
                $query->where('tutor_id', $tutor->id);
            })
            ->orderByDesc('data_acao')
            ->get();

        return response()->json($historicos);

    } catch (\Exception $e) {
        Log::error('Erro ao buscar históricos: ' . $e->getMessage());
        return response()->json(['error' => 'Erro interno ao buscar históricos'], 500);
    }
}

}
