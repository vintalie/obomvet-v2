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
    $user = $request->user();

    if (!$user || !$user->tutor) {
        return response()->json(['error' => 'Usuário tutor não autenticado'], 401);
    }

    $validated = $request->validate([
        'descricao_sintomas' => 'required|string',
        'nivel_urgencia' => 'required|in:baixa,media,alta,critica',
        'pet_id' => 'required|exists:pets,id',
    ]);

    // Define tutor_id automaticamente
    $validated['tutor_id'] = $user->tutor->id;

    // --- NOVO: Selecionar a clínica mais próxima ---
    $pet = \App\Models\Pet::find($validated['pet_id']);

    if ($pet && $pet->latitude && $pet->longitude) {
        $clinica = \App\Models\Clinica::orderByRaw("
            ST_Distance_Sphere(
                point(latitude, longitude),
                point(?, ?)
            ) ASC
        ", [$pet->latitude, $pet->longitude])->first();
    } else {
        // fallback: primeira clínica cadastrada
        $clinica = \App\Models\Clinica::first();
    }

    if (!$clinica) {
        return response()->json(['error' => 'Nenhuma clínica cadastrada'], 400);
    }

    $validated['clinica_id'] = $clinica->id;

    $emergencia = Emergencia::create($validated);

    return response()->json([
        'emergencia' => $emergencia,
        'clinica' => $clinica
    ], 201);
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
    public function meus(Request $request)
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['error' => 'Usuário não autenticado'], 401);
    }

    $emergencias = \App\Models\Emergencia::with('pet')
        ->where('tutor_id', $user->id)
        ->orderByDesc('data_abertura')
        ->get();

    return response()->json($emergencias);
}

}
