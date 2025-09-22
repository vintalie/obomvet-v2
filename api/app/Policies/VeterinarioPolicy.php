<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Veterinario;
use Illuminate\Auth\Access\Response;

class VeterinarioPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return $user->tipo === 'tutor' || $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Veterinario $veterinario): bool
    {
        return $user->veterinario->id === null;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->veterinario->id === null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Veterinario $veterinario): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Veterinario $veterinario): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $user, Veterinario $veterinario): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $user, Veterinario $veterinario): bool
    {
        return false;
    }
}
