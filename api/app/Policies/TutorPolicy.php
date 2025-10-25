<?php

namespace App\Policies;

use App\Models\Tutor;
use App\Models\Usuario;

class TutorPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Tutor $tutor): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, Tutor $tutor): bool
    {
        return true;
    }

    public function delete(Usuario $user, Tutor $tutor): bool
    {
        return true;
    }
}