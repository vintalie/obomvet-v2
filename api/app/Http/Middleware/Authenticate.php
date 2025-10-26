<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Auth\AuthenticationException;

class Authenticate extends Middleware
{
    /**
     * Manipula requisições não autenticadas.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        // Retorna JSON em vez de tentar redirecionar para /login
        throw new AuthenticationException(
            'Não autenticado. Token ausente ou inválido.',
            $guards,
            $this->redirectTo($request)
        );
    }

    /**
     * Define o caminho para redirecionamento (não usado em APIs JWT).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function redirectTo($request): ?string
    {
        // Retorna null para impedir o erro de rota "login"
        return $request->expectsJson() ? null : null;
    }
}
