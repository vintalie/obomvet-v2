<?php

namespace App\Policies;

use App\Models\HistoricoAtendimento;
use App\Models\Usuario;

class HistoricoAtendimentoPolicy
{
    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, HistoricoAtendimento $historico): bool
    {
        return true;
    }

    public function create(Usuario $user): bool
    {
        return true;
    }

    public function update(Usuario $user, HistoricoAtendimento $historico): bool
    {
        return true;
    }

    public function delete(Usuario $user, HistoricoAtendimento $historico): bool
    {
        return true;
    }
}