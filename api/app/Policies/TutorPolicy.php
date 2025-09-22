<?php

namespace App\Policies;

use App\Models\Tutor;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class TutorPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Tutor $tutor): bool
    {
        return $user->tipo === 'tutor' && $user->tutor->id === $user->tutor->id || $user->tipo === 'veterinario' && $tutor->emergencias()->where('cd_veterinario', $user->veterinario->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->tutor->id === null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Tutor $tutor): bool
    {
        return $user->tutor->id === $user->cd_tutor;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Tutor $tutor): bool
    {
        return $user->tutor->id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $user, Tutor $tutor): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $user, Tutor $tutor): bool
    {
        return $user->tipo === 'admin';

    }
}
