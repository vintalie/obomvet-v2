<?php

namespace App\Policies;

use App\Models\Usuario;

class UsuarioPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return true; // Ajuste conforme regras de negócio
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Usuario $usuario): bool
    {
        // por padrão permitimos visualizar; você pode restringir a apenas o próprio usuário
        return true; // Ajuste conforme regras de negócio
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return true; // Ajuste conforme regras de negócio
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Usuario $usuario): bool
    {
        // Exemplo: apenas o próprio usuário pode atualizar seu registro
        return $user->id === $usuario->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Usuario $usuario): bool
    {
        // Exemplo: apenas o próprio usuário pode excluir seu registro
        return $user->id === $usuario->id;
    }
}
