<?php

namespace App\Http\Controllers\Api;

use App\Models\HistoricoAtendimento;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HistoricoAtendimentoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(HistoricoAtendimento::class, 'historico');
    }

    public function index()
    {
        return HistoricoAtendimento::all();
    }

    public function store(Request $request)
    {
        return HistoricoAtendimento::create($request->all());
    }

    public function show(HistoricoAtendimento $historico)
    {
        return $historico;
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
        return $historico->emergencia;
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
}
