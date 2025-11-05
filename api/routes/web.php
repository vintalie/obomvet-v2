<?php

use Illuminate\Support\Facades\Route;

// use App\Http\Controllers\Api\{

//     PushController
// };


// // Email verification
// Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
//     $request->fulfill();
//     return response()->json(['message' => 'E-mail verificado com sucesso!']);
// })->middleware(['auth:sanctum', 'signed'])->name('verification.verify');
// // Rota para reenviar link
// Route::post('/email/resend', function (Request $request) {
//     $request->user()->sendEmailVerificationNotification();
//     return response()->json(['message' => 'Link de verificação reenviado!']);
// })->middleware(['auth:sanctum'])->name('verification.send');


// // routes/api.php
// Route::post('/save-subscription', [PushController::class, 'store']);
// Route::post('/send-push', [PushController::class, 'send']);