<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('clinicas', function ($user) {
    \Log::info('Inscrição no canal clinicas', ['user' => $user]);
    return $user && $user->tipo === 'clinica';
});

Broadcast::channel('emergencias', function ($user) {
    return $user->tipo === 'clinica' || $user->tipo === 'veterinario';
});
Broadcast::channel('veterinarios', function ($user) {
    return $user->tipo === 'veterinario';
});
Broadcast::channel('tutores', function ($user) {
    return $user->tipo === 'tutor';
});