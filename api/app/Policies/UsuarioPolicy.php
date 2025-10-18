<?php

namespace App\Policies;

use App\Models\Usuario;

class UsuarioPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return $user->tipo === 'admin';
    }

    public function view(Usuario $auth, Usuario $target): bool
    {
        return $auth->id === $target->id || $auth->tipo === 'admin';
    }

    public function create(Usuario $user): bool
    {
        return $user->tipo === 'admin';
    }

    public function update(Usuario $auth, Usuario $target): bool
    {
        return $auth->id === $target->id || $auth->tipo === 'admin';
    }

    public function delete(Usuario $auth, Usuario $target): bool
    {
        return $auth->id === $target->id || $auth->tipo === 'admin';
    }

    public function restore(Usuario $user, Usuario $target): bool
    {
        return $user->tipo === 'admin';
    }

    public function forceDelete(Usuario $user, Usuario $target): bool
    {
        return $user->tipo === 'admin';
    }
}
