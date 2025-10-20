<?php

use Illuminate\Support\Facades\Broadcast;


Broadcast::routes(['middleware' => ['auth:sanctum']]);

Broadcast::channel('veterinarios', function ($user) {
    return $user->tipo === 'veterinario';
});

Broadcast::channel('clinicas', function ($user) {
    return $user->tipo === 'clinica';
});