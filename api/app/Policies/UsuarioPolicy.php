<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use Illuminate\Auth\Access\HandlesAuthorization;
use App\Models\Usuario;
use App\Models\User;

class UsuarioPolicy
{
    use HandlesAuthorization;
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
    public function view(Usuario $authenticatedUser, Usuario $targetUser)
    {
        // Permite acesso apenas se o ID do usuário autenticado for igual ao ID do usuário solicitado
        return $authenticatedUser->id === $targetUser->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->tipo === 'admin'  || $user->tipo === 'admin';;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $authenticatedUser, Usuario $targetUser)
    {
        // Permite acesso apenas se o ID do usuário autenticado for igual ao ID do usuário solicitado
        return $authenticatedUser->id === $targetUser->id  || $authenticatedUser->tipo === 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $authenticatedUser, Usuario $targetUser)
    {
        // Permite acesso apenas se o ID do usuário autenticado for igual ao ID do usuário solicitado
        return $authenticatedUser->id === $targetUser->id || $authenticatedUser->tipo === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */

}
