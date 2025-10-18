<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any broadcast services.
     */
    public function boot(): void
    {
        /**
         * Registra as rotas necessárias para autenticação de canais privados.
         * 
         * Aqui usamos o middleware 'auth:sanctum' porque sua API autentica via token.
         * Assim, o Laravel Echo (frontend) pode enviar o token Bearer no header.
         */
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        /**
         * Carrega os canais definidos em routes/channels.php
         * Exemplo de canal: Broadcast::channel('veterinarios', fn ($user) => $user->tipo === 'veterinario');
         */
        require base_path('routes/channels.php');
    }
}
