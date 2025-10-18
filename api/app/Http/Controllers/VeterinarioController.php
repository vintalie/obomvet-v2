<?php

namespace App\Http\Controllers;

use App\Models\Veterinario;
use App\Policies\VeterinarioPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class VeterinarioController extends Controller
{
// use DisableAuthorization;
   protected $model = Veterinario::class;
   protected $policy = VeterinarioPolicy::class;

   
   
   public function searchableBy(): array
    {
        return ['nome_completo', 'crmv', 'especialidade', 'telefone_emergencia', 'disponivel_24h']; // Atributos que podem ser pesquisados
    }
   
}
