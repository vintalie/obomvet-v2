<?php

namespace App\Http\Controllers;

use App\Models\Clinica;
use App\Policies\ClinicaPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class ClinicaController extends Controller
{
// use DisableAuthorization;
   protected $model = Clinica::class;
   protected $policy = ClinicaPolicy::class;

   public function indexPublic()
{
    // Retorna apenas os campos necessários para o mapa
    return Clinica::select('id', 'nome_fantasia', 'endereco', 'localizacao', 'telefone_emergencia')->get();
}
}