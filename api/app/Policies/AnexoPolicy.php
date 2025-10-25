<?php

namespace App\Policies;

use App\Models\Anexo;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class AnexoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user): bool
    {
        return true; // Você pode ajustar conforme suas regras de negócio
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, Anexo $anexo): bool
    {
        return true; // Você pode ajustar conforme suas regras de negócio
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return true; // Você pode ajustar conforme suas regras de negócio
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, Anexo $anexo): bool
    {
        return true; // Você pode ajustar conforme suas regras de negócio
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, Anexo $anexo): bool
    {
        return true; // Você pode ajustar conforme suas regras de negócio
    }
}