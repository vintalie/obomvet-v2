<?php

namespace App\Http\Controllers\Api;

use App\Models\Usuario;
use App\Models\Tutor;
use App\Models\Veterinario;
use App\Models\Clinica;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Usuario::class, 'usuario');
    }

    public function index()
    {
        return Usuario::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
            'tipo' => 'nullable|string'
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $usuario = Usuario::create($validated);

        // Se o tipo foi informado, crie o modelo associado (tutor/veterinario/clinica) se ainda não existir
        $associated = $this->ensureAssociatedModel($usuario);

        $payload = $usuario->toArray();
        $payload = array_merge($payload, $this->attachedIds($usuario));

        return response()->json($payload, 201);
    }

    public function show(Usuario $usuario)
    {
        $payload = $usuario->toArray();
        $payload = array_merge($payload, $this->attachedIds($usuario));
        return $payload;
    }

    public function update(Request $request, Usuario $usuario)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'email' => 'sometimes|email|unique:usuarios,email,' . $usuario->id,
            'password' => 'sometimes|string|min:6',
            'tipo' => 'sometimes|string'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $usuario->update($validated);

        // Se o tipo foi alterado/definido, garanta que o modelo associado exista
        $associated = $this->ensureAssociatedModel($usuario);

        $payload = $usuario->toArray();
        $payload = array_merge($payload, $this->attachedIds($usuario));

        return $payload;
    }

    public function destroy(Usuario $usuario)
    {
        $usuario->delete();
        return response()->noContent();
    }

    /**
     * Retorna o id/type do modelo associado (tutor, veterinario ou clinica) se existir
     */
    protected function getAssociated(Usuario $usuario)
    {
        if ($usuario->isTutor() && $usuario->tutor) {
            return ['type' => 'tutor', 'id' => $usuario->tutor->id];
        }

        if ($usuario->isVeterinario() && $usuario->veterinario) {
            return ['type' => 'veterinario', 'id' => $usuario->veterinario->id];
        }

        if ($usuario->isClinica() && $usuario->clinica) {
            return ['type' => 'clinica', 'id' => $usuario->clinica->id];
        }

        return null;
    }

    /**
     * Retorna um array com as chaves clinica_id, veterinario_id e tutor_id (valores ou null)
     */
    protected function attachedIds(Usuario $usuario)
    {
        $out = [];

        if ($usuario->clinica && $usuario->clinica->id) {
            $out['clinica_id'] = $usuario->clinica->id;
        }

        if ($usuario->veterinario && $usuario->veterinario->id) {
            $out['veterinario_id'] = $usuario->veterinario->id;
        }

        if ($usuario->tutor && $usuario->tutor->id) {
            $out['tutor_id'] = $usuario->tutor->id;
        }

        return $out;
    }

    /**
     * Garante que o modelo associado exista para o usuário (cria se necessário) e retorna os dados
     */
    protected function ensureAssociatedModel(Usuario $usuario)
    {
        // Se não houver tipo definido, nada a fazer
        if (empty($usuario->tipo)) {
            return null;
        }

        if ($usuario->isTutor()) {
            if (! $usuario->tutor) {
                $tutor = $usuario->tutor()->create([]);
                return ['type' => 'tutor', 'id' => $tutor->id];
            }
            return ['type' => 'tutor', 'id' => $usuario->tutor->id];
        }

        if ($usuario->isVeterinario()) {
            if (! $usuario->veterinario) {
                $vet = $usuario->veterinario()->create([]);
                return ['type' => 'veterinario', 'id' => $vet->id];
            }
            return ['type' => 'veterinario', 'id' => $usuario->veterinario->id];
        }

        if ($usuario->isClinica()) {
            if (! $usuario->clinica) {
                $clinica = $usuario->clinica()->create([]);
                return ['type' => 'clinica', 'id' => $clinica->id];
            }
            return ['type' => 'clinica', 'id' => $usuario->clinica->id];
        }

        return null;
    }
}
