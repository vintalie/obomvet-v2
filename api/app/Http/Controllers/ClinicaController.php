<?php

namespace App\Http\Controllers;

use App\Models\Clinica;
use App\Policies\ClinicaPolicy;
use Orion\Http\Controllers\Controller;

class ClinicaController extends Controller
{
   protected $model = Clinica::class;
   protected $policy = ClinicaPolicy::class;
   
}
