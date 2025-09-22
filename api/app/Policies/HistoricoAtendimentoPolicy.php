<?php

namespace App\Policies;

use App\Models\HistoricoAtendimento;
use App\Models\Emergencia;
use App\Models\Tutor;
use App\Models\Veterinario;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class HistoricoAtendimentoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $user, HistoricoAtendimento $histAtendimento): bool
    {
        return $user->tutor->id === $histAtendimento->emergencia->tutor_id || $user->veterinario->id === $histAtendimento->emergencia->cd_veterinario;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $user, HistoricoAtendimento $historicoAtendimento): bool
    {
        return $user->tutor->id === $historicoAtendimento->emergencia->tutor_id || $user->veterinario->id === $historicoAtendimento->emergencia->cd_veterinario;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $user): bool
    {
        return $user->tipo === 'tutor' || $user->tipo === 'veterinario';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $user, HistoricoAtendimento $historicoAtendimento): bool
    {
        return $user->tutor->id === $historicoAtendimento->emergencia->tutor_id || $user->veterinario->id === $historicoAtendimento->emergencia->cd_veterinario;;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $user, HistoricoAtendimento $historicoAtendimento): bool
    {
        return $user->tutor->id === $historicoAtendimento->emergencia->tutor_id || $user->veterinario->id === $historicoAtendimento->emergencia->cd_veterinario;;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $user, HistoricoAtendimento $historicoAtendimento): bool
    {
        return $user->tipo === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $user, HistoricoAtendimento $historicoAtendimento): bool
    {
        return $user->tipo === 'admin';

    }
}
