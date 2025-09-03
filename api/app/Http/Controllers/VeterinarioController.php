<?php

namespace App\Http\Controllers;

use App\Models\Veterinario;
use Orion\Http\Controllers\Controller;

class VeterinarioController extends Controller
{
   protected $model = Veterinario::class;
   
   
   public function searchableBy(): array
    {
        return ['nome_completo', 'crmv', 'especialidade', 'telefone_emergencia', 'disponivel_24h']; // Atributos que podem ser pesquisados
    }
   
}
