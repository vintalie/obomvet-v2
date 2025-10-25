<?php

namespace App\Providers;

use App\Models\Anexo;
use App\Models\Clinica;
use App\Models\Emergencia;
use App\Models\HistoricoAtendimento;
use App\Models\Pet;
use App\Models\Prontuario;
use App\Models\Tutor;
use App\Models\Veterinario;
use App\Policies\AnexoPolicy;
use App\Policies\ClinicaPolicy;
use App\Policies\EmergenciaPolicy;
use App\Policies\HistoricoAtendimentoPolicy;
use App\Policies\PetPolicy;
use App\Policies\ProntuarioPolicy;
use App\Policies\TutorPolicy;
use App\Policies\VeterinarioPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Anexo::class => AnexoPolicy::class,
        Clinica::class => ClinicaPolicy::class,
        Emergencia::class => EmergenciaPolicy::class,
        HistoricoAtendimento::class => HistoricoAtendimentoPolicy::class,
        Pet::class => PetPolicy::class,
        Prontuario::class => ProntuarioPolicy::class,
        Tutor::class => TutorPolicy::class,
        Veterinario::class => VeterinarioPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}