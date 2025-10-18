<?php

namespace App\Policies;

use App\Models\Emergencia;
use App\Models\Usuario;

class EmergenciaPolicy
{
    public function viewAny(?Usuario $user, Emergencia $emergencia): bool
    {
        return true; // qualquer um pode listar emergências (ou aplicar restrição de tutor/veterinario)
    }

    public function view(?Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    public function create(?Usuario $user): bool
    {
        return true; // criação pública sem login
    }

    public function update(?Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    public function delete(?Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    public function restore(?Usuario $user, Emergencia $emergencia): bool
    {
        return $user && $user->tipo === 'admin';
    }

    public function forceDelete(?Usuario $user, Emergencia $emergencia): bool
    {
        return $user && $user->tipo === 'admin';
    }
}
