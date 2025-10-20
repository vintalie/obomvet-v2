<?php

namespace App\Http\Controllers;

use App\Models\Clinica;
use App\Policies\ClinicaPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Requests\Request;
use Orion\Http\Controllers\Controller;

class ClinicaController extends Controller
{
// use DisableAuthorization;
   protected $model = Clinica::class;
   protected $policy = ClinicaPolicy::class;
   

    public function indexPublic()
   { // preciso remover essa funlão depois
    // Retorna apenas os campos necessários para o mapa
    return Clinica::select('id', 'nome_fantasia', 'endereco', 'localizacao', 'publica' ,'telefone_emergencia')->get();
   }
      public function searchableBy(): array
    {
        return ['publica', 'especialidade', 'telefone_emergencia', 'disponivel_24h']; // Atributos que podem ser pesquisados
    }
}