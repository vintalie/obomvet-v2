<?php

namespace App\Policies;

use App\Models\Prontuario;
use App\Models\Usuario;

class ProntuarioPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Prontuario $prontuario): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Prontuario $prontuario): bool
    {
        return true;
    }

    public function delete(Usuario $user, Prontuario $prontuario): bool
    {
        return true;
    }
}