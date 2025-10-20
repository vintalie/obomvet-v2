<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        $headers = [
            'Access-Control-Allow-Origin' => 'http://localhost:5173', // frontend exato
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        // Responde requisições OPTIONS (preflight)
        if ($request->getMethod() === "OPTIONS") {
            return response()->json('OK', 204, $headers);
        }

        $response = $next($request);

        // Adiciona headers na resposta
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
