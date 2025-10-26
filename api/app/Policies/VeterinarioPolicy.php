<?php

namespace App\Policies;

use App\Models\Veterinario;
use App\Models\Usuario;

class VeterinarioPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Veterinario $veterinario): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Veterinario $veterinario): bool
    {
        return true;
    }

    public function delete(Usuario $user, Veterinario $veterinario): bool
    {
        return true;
    }
}