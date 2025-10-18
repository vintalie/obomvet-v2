<?php

namespace App\Http\Middleware;

use Closure;

class CorsMiddleware
{
    public function handle($request, Closure $next)
    {
        $headers = [
            // 'Access-Control-Allow-Origin' => 'http://localhost:5173', // aqui irá ser a url do frontend
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Typew Authorization, X-Requested-With, Accept',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        if ($request->getMethod() === "OPTIONS") {
            return response()->json('OK', 204, $headers);
        }

        $response = $next($request);

        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
