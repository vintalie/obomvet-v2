<?php

namespace App\Policies;

use App\Models\Pet;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class PetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return $user->tipo === 'tutor' || $user->pet->cd_tutor === $user->tutor->id;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Pet $pet): bool
    {   

        //fazer com que o tutor veja apenas os pets dele
        //fazer com que o veterinario veja apenas os pets que possui uma emergencia vinculada com o veterinario
        return $user->tipo === 'tutor' && $pet->cd_tutor === $user->tutor->id || $user->tipo === 'veterinario' && $pet->emergencias()->where('cd_veterinario', $user->veterinario->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->tipo === 'tutor';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'tutor' && $pet->cd_tutor === $user->tutor->id || $user->tipo === 'veterinario' && $pet->emergencias()->where('cd_veterinario', $user->veterinario->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'tutor';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'admin';
    }
}
