<?php

namespace App\Http\Controllers\Api;

use App\Models\Clinica;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClinicaController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Clinica::class, 'clinica');
    }

    public function index()
    {
        return Clinica::all();
    }

    public function store(Request $request)
    {
        return Clinica::create($request->all());
    }

    public function show(Clinica $clinica)
    {
        return $clinica;
    }

    public function update(Request $request, Clinica $clinica)
    {
        $clinica->update($request->all());
        return $clinica;
    }

    public function destroy(Clinica $clinica)
    {
        $clinica->delete();
        return response()->noContent();
    }

    public function getVeterinarios(Clinica $clinica)
    {
        return $clinica->veterinarios()->get();
    }

    public function getAnexo(Clinica $clinica)
    {
        return $clinica->anexos ?? null;
    }

    public function storeVeterinario(Request $request, Clinica $clinica)
    {
        $veterinario = $clinica->veterinarios()->create($request->all());
        return response()->json($veterinario, 201);
    }

    public function storeAnexo(Request $request, Clinica $clinica)
    {
        $arquivo = $request->file('arquivo');
        $anexo = $clinica->anexo()->create([
            'arquivo' => $arquivo->store('anexos', 'public'),
            'descricao' => $request->descricao
        ]);
        return response()->json($anexo, 201);
    }
}
