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
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Route;

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
    
    Orion::hasManyResource('tutor', 'pets', PetController::class)->withSoftDeletes();


    Orion::hasOneResource('usuario','clinica', ClinicaController::class)->withSoftDeletes();

    
    Orion::resource(
        name: '/veterinarios',
        controller: VeterinarioController::class
    )->middleware('auth:sanctum');

    Orion::hasOneResource('usuario','veterinario', VeterinarioController::class)->withSoftDeletes();


    Orion::resource(
        name: '/emergencias',
        controller: EmergenciaController::class
    );
    Orion::hasManyResource('emergencia', 'historico', HistoricoAtendimentoController::class)->withSoftDeletes();


    

    });



Route::post('ia/transcribe', [IAController::class, 'transcribe']);
