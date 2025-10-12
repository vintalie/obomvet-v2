<?php

namespace App\Http\Controllers;

use App\Models\Prontuario;
use App\Policies\ProntuarioPolicy;
use Orion\Http\Controllers\Controller;

class ProntuarioController extends Controller
{
   protected $model = Prontuario::class;
   protected $policy = ProntuarioPolicy::class;
   
}
