<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('clinicas', function ($user) {
    return $user->tipo === 'clinica' || $user->tipo === 'veterinario';
});