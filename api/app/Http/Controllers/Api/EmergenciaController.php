<?php

namespace App\Http\Controllers\Api;

use App\Models\Emergencia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EmergenciaController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Emergencia::class, 'emergencia');
    }

    public function index()
    {
        return Emergencia::all();
    }

    public function store(Request $request)
    {
        return Emergencia::create($request->all());
    }

    public function show(Emergencia $emergencia)
    {
        return $emergencia;
    }

    public function update(Request $request, Emergencia $emergencia)
    {
        $emergencia->update($request->all());
        return $emergencia;
    }

    public function destroy(Emergencia $emergencia)
    {
        $emergencia->delete();
        return response()->noContent();
    }

    public function getHistoricos(Emergencia $emergencia)
    {
        return $emergencia->historicoAtendimentos()->get();
    }

    public function getAnexo(Emergencia $emergencia)
    {
        return $emergencia->anexos;
    }

    public function storeHistorico(Request $request, Emergencia $emergencia)
    {
        $historico = $emergencia->historicoAtendimentos()->create($request->all());
        return response()->json($historico, 201);
    }

    public function storeAnexo(Request $request, Emergencia $emergencia)
    {
        $arquivo = $request->file('arquivo');
        $anexo = $emergencia->anexos()->create([
            'arquivo' => $arquivo->store('anexos', 'public'),
            'descricao' => $request->descricao
        ]);
        return response()->json($anexo, 201);
    }
}
