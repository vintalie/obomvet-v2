<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Policies\EmergenciaPolicy;
use Illuminate\Http\Request;

use App\Services\DistanceService;

use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class EmergenciaController extends Controller
{
// use DisableAuthorization;
    /**
     * Model que o Orion vai gerenciar
     */
    protected $model = Emergencia::class;

    /**
     * Policy para controlar permissões
     */
    protected $policy = EmergenciaPolicy::class;

    /**
     * Se precisar sobrescrever algum método do Orion, pode fazer aqui.
     * Exemplo: customização do create para permitir criação sem login
     */
    protected function afterCreate(Request $request, $post){

    }
}
