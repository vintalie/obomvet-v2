<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\{AnexoController, ClinicaController, EmergenciaController, HistoricoAtendimentoController, PetController, ProntuarioController, TutorController, VeterinarioController};

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
});

// Rotas RESTful para os modelos
// Registramos individualmente para poder aplicar middleware `auth:api`
Route::apiResource('anexos', AnexoController::class);
Route::apiResource('clinicas', ClinicaController::class)->middleware('auth:api');
Route::apiResource('emergencias', EmergenciaController::class);
Route::apiResource('historicos', HistoricoAtendimentoController::class);
Route::apiResource('pets', PetController::class);
Route::apiResource('prontuarios', ProntuarioController::class)->middleware('auth:api');
Route::apiResource('tutores', TutorController::class)->middleware('auth:api');
Route::apiResource('veterinarios', VeterinarioController::class);

// Rotas aninhadas usando métodos dos controllers

// Tutors -> Pets e Emergencias
Route::get('tutores/{tutor}/pets', [TutorController::class, 'getPets'])->middleware('auth:api');
Route::post('tutores/{tutor}/pets', [TutorController::class, 'storePet'])->middleware('auth:api');
Route::get('tutores/{tutor}/emergencias', [TutorController::class, 'getEmergencias'])->middleware('auth:api');

// Pets -> Tutors, Emergencias, Prontuarios e Foto
Route::get('pets/{pet}/tutores', [PetController::class, 'getTutors']);
Route::get('pets/{pet}/emergencias', [PetController::class, 'getEmergencias']);
Route::post('pets/{pet}/emergencias', [PetController::class, 'storeEmergencia']);
Route::get('pets/{pet}/prontuarios', [PetController::class, 'getProntuarios']);
Route::post('pets/{pet}/prontuarios', [PetController::class, 'storeProntuario']);
Route::get('pets/{pet}/foto', [PetController::class, 'getFoto']);

// Veterinarios -> Emergencias, Historicos e Anexo
Route::get('veterinarios/{veterinario}/emergencias', [VeterinarioController::class, 'getEmergencias']);
Route::post('veterinarios/{veterinario}/emergencias', [VeterinarioController::class, 'storeEmergencia']);
Route::get('veterinarios/{veterinario}/historicos', [VeterinarioController::class, 'getHistoricos']);
Route::post('veterinarios/{veterinario}/historicos', [VeterinarioController::class, 'storeHistorico']);
Route::get('veterinarios/{veterinario}/anexo', [VeterinarioController::class, 'getAnexo']);
Route::post('veterinarios/{veterinario}/anexo', [VeterinarioController::class, 'storeAnexo']);

// Clinicas -> Veterinarios e Anexo
Route::get('clinicas/{clinica}/veterinarios', [ClinicaController::class, 'getVeterinarios'])->middleware('auth:api');
Route::post('clinicas/{clinica}/veterinarios', [ClinicaController::class, 'storeVeterinario'])->middleware('auth:api');
Route::get('clinicas/{clinica}/anexo', [ClinicaController::class, 'getAnexo'])->middleware('auth:api');
Route::post('clinicas/{clinica}/anexo', [ClinicaController::class, 'storeAnexo'])->middleware('auth:api');

// Emergencias -> Historicos e Anexo
Route::get('emergencias/{emergencia}/historicos', [EmergenciaController::class, 'getHistoricos'])->middleware('auth:api');
Route::post('emergencias/{emergencia}/historicos', [EmergenciaController::class, 'storeHistorico'])->middleware('auth:api');
Route::get('emergencias/{emergencia}/anexo', [EmergenciaController::class, 'getAnexo'])->middleware('auth:api');
Route::post('emergencias/{emergencia}/anexo', [EmergenciaController::class, 'storeAnexo'])->middleware('auth:api');

// Historicos -> Emergencia e Anexo
Route::get('historicos/{historico}/emergencia', [HistoricoAtendimentoController::class, 'getEmergencia']);
Route::get('historicos/{historico}/anexo', [HistoricoAtendimentoController::class, 'getAnexo']);
Route::post('historicos/{historico}/anexo', [HistoricoAtendimentoController::class, 'storeAnexo']);

// Prontuarios -> Pet e Anexos
Route::get('prontuarios/{prontuario}/pet', [ProntuarioController::class, 'getPet'])->middleware('auth:api');
Route::get('prontuarios/{prontuario}/anexos', [ProntuarioController::class, 'getAnexos'])->middleware('auth:api');
Route::post('prontuarios/{prontuario}/anexos', [ProntuarioController::class, 'storeAnexo'])->middleware('auth:api');

// Anexo -> Anexable (polimórfico)
Route::get('anexos/{anexo}/anexable', [AnexoController::class, 'getAnexable']);
