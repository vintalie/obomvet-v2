<?php

namespace App\Http\Controllers;


use App\Models\Usuario;
use App\Policies\UsuarioPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class UsuarioController extends Controller
{
// use DisableAuthorization;
   protected $model = Usuario::class;
   protected $policy = UsuarioPolicy::class;

}