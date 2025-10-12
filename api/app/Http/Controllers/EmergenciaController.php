<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Policies\EmergenciaPolicy;
use Orion\Http\Controllers\Controller;

class EmergenciaController extends Controller
{
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
    public function create(array $data)
    {
        // Criação sem necessidade de usuário logado
        return $this->model::create($data);
    }
}
