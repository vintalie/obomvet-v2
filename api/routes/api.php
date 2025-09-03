<?php

use App\Http\Controllers\{
    AutenticadorController,
    UsuarioController,    
    TutorController,
    PetController,
    VeterinarioController,
    EmergenciaController,
    HistoricoAtendimentoController
};
use Illuminate\Support\Facades\Route;

use Orion\Facades\Orion;

Route::post('auth/register', [AutenticadorController::class, 'register']);
Route::post('auth/login', [AutenticadorController::class, 'login']);
Route::post('auth/logout', [AutenticadorController::class, 'logout'])->middleware('auth:sanctum');
    

Route::group(['as' => 'api.'], function() {

    Orion::resource(
        name: '/usuarios',
        controller: UsuarioController::class
    )->middleware(['auth:sanctum', 'ability:tutor']);
    Orion::resource(
        name: '/tutores',
        controller: TutorController::class
    )->middleware('auth:sanctum');
    Orion::resource(
        name: '/pets',
        controller: PetController::class
    )->middleware('auth:sanctum');
    Orion::resource(
        name: '/veterinarios',
        controller: VeterinarioController::class
    )->middleware('auth:sanctum');

    Orion::resource(
        name: '/emergencias',
        controller: EmergenciaController::class
    );
    Orion::hasManyResource('emergencia', 'historico', HistoricoAtendimentoController::class)->withSoftDeletes();



});

