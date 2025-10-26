<?php

namespace App\Policies;

use App\Models\Emergencia;
use App\Models\Tutor;
use App\Models\Veterinario;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class EmergenciaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user, Emergencia $emergencia): bool
    {
        return $user->tipo === 'veterinario' || ($user->tipo === 'tutor' && $emergencia->tutor_id === $user->tutor->cd_tutor);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Emergencia $emergencia): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Emergencia $emergencia): bool
    {
        return $user->tipo === 'tutor' && $emergencia->tutor_id === $user->tutor->id || $user->tipo === 'veterinario' && $emergencia->cd_veterinario === $user->veterinario->id && $emergencia->cd_clinica === $user->clinica->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Emergencia $emergencia): bool
    {
        return $user->tipo === 'tutor' && $emergencia->tutor_id === $user->tutor->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $user, Emergencia $emergencia): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $user, Emergencia $emergencia): bool
    {
        return $user->tipo === 'admin';
    }
}