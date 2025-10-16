<?php

use App\Http\Controllers\{
    AutenticadorController,
    UsuarioController,
    TutorController,
    PetController,
    VeterinarioController,
    ClinicaController,
    EmergenciaController,
    HistoricoAtendimentoController,
    IAController
};
use Illuminate\Support\Facades\Route;
use Orion\Facades\Orion;
use Illuminate\Http\Request;

// --------------------
// Rotas de autenticação
// --------------------
Route::post('auth/register', [AutenticadorController::class, 'register']);
Route::post('auth/login', [AutenticadorController::class, 'login']);
Route::post('auth/logout', [AutenticadorController::class, 'logout'])->middleware('auth:sanctum');

// --------------------
// Rotas públicas
// --------------------
Route::post('/emergencias', [EmergenciaController::class, 'store']); // rota pública
Route::post('ia/transcribe', [IAController::class, 'transcribe']);

// --------------------
// Rotas protegidas (Orion + Sanctum)
// --------------------
Route::group(['as' => 'api.'], function() {

    Orion::resource('/usuarios', UsuarioController::class)
        ->middleware(['auth:sanctum']);

    Orion::resource('/tutors', TutorController::class)
        ->middleware(['auth:sanctum']);
    
    Orion::hasOneResource('usuario', 'tutor', TutorController::class)
        ->withSoftDeletes();

    Orion::resource('/pets', PetController::class)
        ->middleware(['auth:sanctum']);

    Orion::hasManyResource('tutor', 'pets', PetController::class)
        ->withSoftDeletes();

    Orion::resource('/clinicas', ClinicaController::class)
        ->middleware(['auth:sanctum']);

    Orion::hasManyResource('clinica', 'veterinario', ClinicaController::class)
        ->withSoftDeletes();

    Orion::hasOneResource('usuario', 'clinica', ClinicaController::class)
        ->withSoftDeletes();

    Orion::resource('/veterinarios', VeterinarioController::class)
        ->middleware(['auth:sanctum']);

    Orion::hasOneResource('usuario', 'veterinario', VeterinarioController::class)
        ->withSoftDeletes();

    // HistoricoAtendimento protegido
    Orion::hasManyResource('emergencia', 'historico', HistoricoAtendimentoController::class)
        ->withSoftDeletes();
});

// --------------------
// Usuário autenticado
// --------------------
Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
    $user = $request->user();

    $tipo = null;
    if ($user->tutor) {
        $tipo = 'tutor';
    } elseif ($user->veterinario) {
        $tipo = 'veterinario';
    }

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'tipo' => $tipo,
    ]);
});
