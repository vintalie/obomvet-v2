<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('veterinarios', function ($user) {
    return $user->tipo === 'veterinario';
});
