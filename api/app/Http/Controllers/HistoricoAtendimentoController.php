<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Models\HistoricoAtendimento;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;
use App\Policies\HistoricoAtendimentoPolicy;
class HistoricoAtendimentoController extends Controller
{
// use DisableAuthorization;
   protected $model = Emergencia::class;
   protected $policy = HistoricoAtendimento::class;

   

   
   
}
