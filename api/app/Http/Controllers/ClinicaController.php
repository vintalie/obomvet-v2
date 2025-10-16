<?php

namespace App\Http\Controllers;

use App\Models\Clinica;
use Orion\Http\Requests\Request;
use Orion\Http\Controllers\Controller;

class ClinicaController extends Controller
{
    protected $model = Clinica::class;

    public function index(Request $request)
    {
        $clinicas = Clinica::all()->map(function ($clinica) {
            [$lat, $lng] = explode(',', $clinica->localizacao);

            return [
                'id' => $clinica->id,
                'nome' => $clinica->nome_fantasia,
                'endereco' => $clinica->endereco,
                'telefone_emergencia' => $clinica->telefone_emergencia,
                'disponivel_24h' => $clinica->disponivel_24h,
                'latitude' => (float) $lat,
                'longitude' => (float) $lng,
            ];
        });

        return response()->json($clinicas);
    }
}
