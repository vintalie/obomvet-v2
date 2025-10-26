<?php

namespace App\Http\Controllers\Api;

use App\Models\Veterinario;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VeterinarioController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Veterinario::class, 'veterinario');
    }

    public function index()
    {
        return Veterinario::all();
    }

    public function store(Request $request)
    {
        return Veterinario::create($request->all());
    }

    public function show(Veterinario $veterinario)
    {
        return $veterinario;
    }

    public function update(Request $request, Veterinario $veterinario)
    {
        $veterinario->update($request->all());
        return $veterinario;
    }

    public function destroy(Veterinario $veterinario)
    {
        $veterinario->delete();
        return response()->noContent();
    }

    public function getEmergencias(Veterinario $veterinario)
    {
        return $veterinario->emergencias()->get();
    }

    public function getHistoricos(Veterinario $veterinario)
    {
        return $veterinario->historicoAtendimentos()->get();
    }

    public function storeEmergencia(Request $request, Veterinario $veterinario)
    {
        $emergencia = $veterinario->emergencias()->create($request->all());
        return response()->json($emergencia, 201);
    }

    public function storeHistorico(Request $request, Veterinario $veterinario)
    {
        $historico = $veterinario->historicoAtendimentos()->create($request->all());
        return response()->json($historico, 201);
    }

    public function storeAnexo(Request $request, Veterinario $veterinario)
    {
        $arquivo = $request->file('arquivo');
        $anexo = $veterinario->anexo()->create([
            'arquivo' => $arquivo->store('anexos', 'public'),
            'descricao' => $request->descricao
        ]);
        return response()->json($anexo, 201);
    }

    public function getAnexo(Veterinario $veterinario)
    {
        return $veterinario->anexos;
    }
}
