<?php

use App\Http\Controllers\{
    AutenticadorController,
    UsuarioController,    
    TutorController,
    PetController,
    VeterinarioController,
    ClinicaController,
    AnexoController,
    ProntuarioController,
    EmergenciaController,
    HistoricoAtendimentoController,
    IAController
};

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;

use Orion\Facades\Orion;

Route::post('auth/register', [AutenticadorController::class, 'register']);
Route::post('auth/login', [AutenticadorController::class, 'login']);
Route::post('auth/logout', [AutenticadorController::class, 'logout'])->middleware('auth:sanctum');






Route::group(['as' => 'api.'], function() {
    
    Orion::resource(
        name: '/usuarios',
        controller: UsuarioController::class
    )->middleware(['auth:sanctum']);
    
    Orion::resource(
        name: '/tutors',
        controller: TutorController::class
    )->middleware('auth:sanctum');
    
    Orion::hasOneResource('usuario','tutor', TutorController::class)->withSoftDeletes();
    
    
    Orion::resource(
        name: '/pets',
        controller: PetController::class
    )->middleware('auth:sanctum');
    
    Orion::hasManyResource('tutor', 'pet', PetController::class)->withSoftDeletes();

    Orion::resource(
        name: '/clinicas',
        controller: ClinicaController::class
    )->middleware(['auth:sanctum']);
    
    Orion::hasOneResource('usuario','clinica', ClinicaController::class)->withSoftDeletes();

    Orion::hasManyResource('clinica', 'veterinario', VeterinarioController::class)->withSoftDeletes();

    
    Orion::resource(
        name: '/veterinarios',
        controller: VeterinarioController::class
    )->middleware('auth:sanctum');

    Orion::hasOneResource('usuario','veterinario', VeterinarioController::class)->withSoftDeletes();


    Orion::resource(
        name: '/prontuarios',
        controller: ProntuarioController::class
    )->middleware('auth:sanctum');

 
    Orion::hasOneResource('clinica','anexo', AnexoController::class)->withSoftDeletes();
    Orion::hasOneResource('pet','anexo', AnexoController::class)->withSoftDeletes();
    Orion::hasOneResource('prontuario','anexo', AnexoController::class)->withSoftDeletes();
    Orion::hasOneResource('emergencia','anexo', AnexoController::class)->withSoftDeletes();
    Orion::hasOneResource('historico','anexo', AnexoController::class)->withSoftDeletes();

        


    Orion::resource(
        name: '/emergencias',
        controller: EmergenciaController::class
    );
    Orion::hasManyResource('emergencia', 'historico', HistoricoAtendimentoController::class)->withSoftDeletes();

    

    });



Route::post('ia/transcribe', [IAController::class, 'transcribe']);

// Rota para verificar o e-mail
Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill(); // marca o usuário como verificado
    return response()->json(['message' => 'E-mail verificado com sucesso!']);
})->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

// Rota para reenviar link
Route::post('/email/resend', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Link de verificação reenviado!']);
})->middleware(['auth:sanctum'])->name('verification.send');
