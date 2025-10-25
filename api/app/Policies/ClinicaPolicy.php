<?php

namespace App\Policies;

use App\Models\Clinica;
use App\Models\Usuario;

class ClinicaPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Clinica $clinica): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Clinica $clinica): bool
    {
        return true;
    }

    public function delete(Usuario $user, Clinica $clinica): bool
    {
        return true;
    }
}