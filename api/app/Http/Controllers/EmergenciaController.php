<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Policies\EmergenciaPolicy;
use Orion\Http\Controllers\Controller;

class EmergenciaController extends Controller
{
   protected $model = Emergencia::class;
   protected $policy = EmergenciaPolicy::class;
   
}
