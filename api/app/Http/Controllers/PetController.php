<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Policies\PetPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PetController extends Controller
{
// use DisableAuthorization;

   
    /**
     * Modelo e política associados ao Orion
     */
    protected $model = Pet::class;
    protected $policy = PetPolicy::class;

    /**
     * Intercepta a criação de um Pet para validar campos e injetar tutor_id
     */
    // protected function beforeCreating(Request $request): Request
    // {
    //     $data = $request->all();

    //     // Tutor logado (garante vínculo com o usuário autenticado)
    //     $data['tutor_id'] = auth()->id();

    //     // Validação de campos obrigatórios
    //     try {
    //         $request->validate([
    //             'nome' => 'required|string|max:255',
    //             'especie' => 'required|string|max:255',
    //             'raca' => 'required|string|max:255',
    //             'idade' => 'nullable|integer|min:0',
    //             'peso' => 'nullable|numeric|min:0',
    //             'alergias' => 'nullable|string',
    //             'medicamentos_continuos' => 'nullable|string',
    //             'cuidados_especiais' => 'nullable|string',
    //         ]);
    //     } catch (ValidationException $e) {
    //         // Retorna erro de validação para o frontend (JSON)
    //         abort(422, json_encode([
    //             'message' => 'Erro de validação',
    //             'errors' => $e->errors(),
    //         ]));
    //     }

    //     // Se a idade for informada, converte em data de nascimento aproximada
    //     if (!empty($data['idade'])) {
    //         $data['data_nascimento'] = now()
    //             ->subYears((int) $data['idade'])
    //             ->format('Y-m-d');
    //     }

    //     // Garante que campos opcionais inexistentes venham como null
    //     $data['alergias'] = $data['alergias'] ?? null;
    //     $data['medicamentos_continuos'] = $data['medicamentos_continuos'] ?? null;
    //     $data['cuidados_especiais'] = $data['cuidados_especiais'] ?? null;

    //     // Aplica os dados modificados ao Request para o Orion processar corretamente
    //     $request->merge($data);
    //     return $request;
    // }
}
