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
   


}
