<?php

namespace App\Policies;

use App\Models\Pet;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class PetPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        // Admin vê todos, tutor vê apenas seus pets, veterinário vê pets vinculados a emergências dele
        return true;
    }

    /**
     * Determine whether the user can view a specific pet.
     */
    public function view(Usuario $user, Pet $pet): bool
    {
        return match($user->tipo) {
            'admin' => true,
            'tutor' => $pet->tutors->contains($user->tutor),
            'veterinario' => $pet->emergencias()->where('cd_veterinario', $user->veterinario->id)->exists(),
            default => false,
        };
    }

    /**
     * Determine whether the user can create a pet.
     */
    public function create(Usuario $user): bool
    {
        return $user->tipo === 'tutor';
    }

    /**
     * Determine whether the user can update a pet.
     */
    public function update(Usuario $user, Pet $pet): bool
    {
        return $this->view($user, $pet); // Pode atualizar se puder ver
    }

    /**
     * Determine whether the user can delete a pet.
     */
    public function delete(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'tutor' && $pet->tutors->contains($user->tutor);
    }

    /**
     * Determine whether the user can restore a pet.
     */
    public function restore(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can permanently delete a pet.
     */
    public function forceDelete(Usuario $user, Pet $pet): bool
    {
        return $user->tipo === 'admin';
    }
}
