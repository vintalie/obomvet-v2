<?php

namespace App\Http\Controllers\Api;

use App\Models\Prontuario;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProntuarioController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Prontuario::class, 'prontuario');
    }

    public function index()
    {
        return Prontuario::all();
    }

    public function store(Request $request)
    {
        return Prontuario::create($request->all());
    }

    public function show(Prontuario $prontuario)
    {
        return $prontuario;
    }

    public function update(Request $request, Prontuario $prontuario)
    {
        $prontuario->update($request->all());
        return $prontuario;
    }

    public function destroy(Prontuario $prontuario)
    {
        $prontuario->delete();
        return response()->noContent();
    }

    public function getPet(Prontuario $prontuario)
    {
        return $prontuario->pet;
    }

    public function getAnexos(Prontuario $prontuario)
    {
        return $prontuario->anexos()->get();
    }

    public function storeAnexo(Request $request, Prontuario $prontuario)
    {
        $request->validate([
            'arquivo' => 'required|file',
            'descricao' => 'required|string'
        ]);

        $path = $request->file('arquivo')->store('anexos', 'public');

        return $prontuario->anexos()->create([
            'arquivo' => $path,
            'descricao' => $request->descricao
        ]);
    }
}
