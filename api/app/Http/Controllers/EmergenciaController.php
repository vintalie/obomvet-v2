<?php

namespace App\Http\Controllers;

use App\Models\Emergencia;
use App\Policies\EmergenciaPolicy;
use Orion\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
     * Sobrescreve o create do Orion para permitir criação pública
     */
    public function create(array $data)
    {
        // Criação sem necessidade de usuário logado
        return $this->model::create($data);
    }

    /**
     * Caso queira outras ações protegidas, não sobrescreva.
     * Orion aplicará a policy automaticamente em update, delete, etc.
     */
}
