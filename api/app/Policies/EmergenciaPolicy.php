<?php

namespace App\Policies;

use App\Models\Emergencia;
use App\Models\Usuario;

class EmergenciaPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    public function delete(Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }
}