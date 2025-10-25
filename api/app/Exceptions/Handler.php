<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * Exceções que não devem ser reportadas.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * Tipos de exceções que não devem gerar logs detalhados.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Método para registrar manipuladores de exceções personalizadas.
     */
    public function register(): void
    {

        $this->renderable(function (TokenInvalidException $e, $request) {
            return response()->json(['error' => 'Token inválido.'], 401);
        });

        $this->renderable(function (TokenExpiredException $e, $request) {
            return response()->json(['error' => 'Token expirado.'], 401);
        });
        // Erro genérico de Model não encontrado
        $this->renderable(function (ModelNotFoundException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Recurso não encontrado.'
                ], 404);
            }
        });

        // Erro de rota inexistente (404)
        $this->renderable(function (NotFoundHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Endpoint não encontrado.'
                ], 404);
            }
        });

        // Erro de autenticação (JWT ou Sanctum)
        $this->renderable(function (AuthenticationException $e, $request) {
            
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'Não autenticado. Token inválido ou ausente.'
                ], 401);
            }
        });

        // Erro de permissão
        $this->renderable(function (AccessDeniedHttpException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => 'Ação não autorizada.'
                ], 403);
            }
        });

        // Erros de validação (formulário, request)
        $this->renderable(function (ValidationException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Erro de validação.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Tratamento genérico de exceções não previstas
        $this->renderable(function (Throwable $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'type'  => class_basename($e),
                ], 500);
            }
        });
    }
}
