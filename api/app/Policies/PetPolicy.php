<?php

namespace App\Policies;

use App\Models\Pet;
use App\Models\Usuario;

class PetPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Pet $pet): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Pet $pet): bool
    {
        return true;
    }

    public function delete(Usuario $user, Pet $pet): bool
    {
        return true;
    }
}