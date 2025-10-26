<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            // Use custom Authenticate middleware for the default "auth" alias so
            // API unauthenticated responses don't redirect to a web "login" route.
            'auth' => \App\Http\Middleware\Authenticate::class,
            'auth.jwt' => \PHPOpenSourceSaver\JWTAuth\Http\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
            /**
            * 🔹 Tratamento global de exceções
            */
            $exceptions->render(function (Throwable $e, $request) {
                if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    return response()->json(['error' => 'Recurso não encontrado'], 404);
                }

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return response()->json(['errors' => $e->errors()], 422);
                }

                return response()->json(['error' => $e->getMessage()], 500);
            });
        })
        ->create();