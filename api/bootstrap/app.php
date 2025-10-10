<?php

require_once __DIR__.'/../vendor/autoload.php';

$app = new Laravel\Lumen\Application(
    dirname(__DIR__)
);

// Ativa Facades e Eloquent ORM
$app->withFacades();
$app->withEloquent();

// ----------------------
// Middleware global
// ----------------------
$app->middleware([
    App\Http\Middleware\CorsMiddleware::class, // Middleware CORS próprio
    // Você pode adicionar outros middlewares globais aqui
]);

// ----------------------
// Middleware de rota
// ----------------------
$app->routeMiddleware([
    'auth' => App\Http\Middleware\Authenticate::class,
]);

// ----------------------
// Carrega rotas
// ----------------------
$app->router->group([
    'namespace' => 'App\Http\Controllers',
], function ($router) {
    require __DIR__.'/../routes/web.php';
    require __DIR__.'/../routes/api.php';
});

// ----------------------
// Configurações adicionais (opcional)
// ----------------------
// Aqui você poderia registrar providers extras, como Orion ou Sanctum
// Exemplo:
// $app->register(Orion\OrionServiceProvider::class);
// $app->register(Laravel\Sanctum\SanctumServiceProvider::class);

return $app;
