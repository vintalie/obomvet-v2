<?php
use Illuminate\Routing\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\{AnexoController, ClinicaController, EmergenciaController, HistoricoAtendimentoController, PetController, ProntuarioController, TutorController, VeterinarioController};

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
});

// Rotas RESTful para os modelos
Route::apiResources([
    'anexos' => AnexoController::class,
    'clinicas' => ClinicaController::class,
    'emergencias' => EmergenciaController::class,
    'historicos' => HistoricoAtendimentoController::class,
    'pets' => PetController::class,
    'prontuarios' => ProntuarioController::class,
    'tutores' => TutorController::class,
    'veterinarios' => VeterinarioController::class,
]);
