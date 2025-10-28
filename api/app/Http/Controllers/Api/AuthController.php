<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrar novo usuário (Tutor, Veterinário ou Clínica)
     */
    public function register(Request $request)
    {
        try {
            $tipo = strtolower($request->tipo ?? '');

            if (!in_array($tipo, ['tutor','veterinario','clinica'])) {
                return response()->json(['error'=>'Tipo de usuário inválido.'], 422);
            }

            $validated = match ($tipo) {
                'tutor' => $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:tutor',
                    'nome_completo' => 'required|string|max:255',
                    'telefone_principal' => 'required|string|max:20',
                    'telefone_alternativo' => 'nullable|string|max:20',
                    'cpf' => 'required|string|size:11|unique:tutors,cpf',
                ]),
                'veterinario' => $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:veterinario',
                    'crmv' => 'required|string|unique:veterinarios,crmv',
                    'nome_completo' => 'required|string|max:255',
                    'localizacao' => 'required|string|max:255',
                    'especialidade' => 'required|string|max:255',
                    'telefone_emergencia' => 'required|string|max:20',
                    'disponivel_24h' => 'required|boolean',
                ]),
                'clinica' => $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:clinica',
                    'cnpj' => 'required|string|unique:clinicas,cnpj',
                    'nome_fantasia' => 'required|string|max:255',
                    'razao_social' => 'required|string|max:255',
                    'endereco' => 'required|string|max:255',
                    'telefone_principal' => 'required|string|max:255',
                    'telefone_emergencia' => 'required|string|max:255',
                    'horario_funcionamento' => 'required|string|max:255',
                    'disponivel_24h' => 'required|boolean',
                    'localizacao' => 'required|string|max:255',
                    'email_contato' => 'nullable|email|max:255',
                ]),
            };

            // Cria usuário
            $user = Usuario::create([
    'name' => $validated['name'],
    'nome_completo' => $validated['nome_completo'] ?? $validated['name'],
    'email' => $validated['email'],
    'password' => Hash::make($validated['password']),
    'tipo' => $validated['tipo'],
    'cpf' => $validated['cpf'] ?? null,
    'cnpj' => $validated['cnpj'] ?? null,
    'telefone_principal' => $validated['telefone_principal'] ?? '',
    'telefone_alternativo' => $validated['telefone_alternativo'] ?? null,
            ]);


            // Cria relação com o tipo específico
            match ($user->tipo) {
                'tutor' => $user->tutor()->create([
                    'nome_completo' => $validated['nome_completo'],
                    'telefone_principal' => $validated['telefone_principal'],
                    'telefone_alternativo' => $validated['telefone_alternativo'] ?? null,
                    'cpf' => $validated['cpf'],
                ]),
                'veterinario' => $user->veterinario()->create([
                    'nome_completo' => $validated['nome_completo'],
                    'crmv' => $validated['crmv'],
                    'localizacao' => $validated['localizacao'],
                    'especialidade' => $validated['especialidade'],
                    'telefone_emergencia' => $validated['telefone_emergencia'],
                    'disponivel_24h' => $validated['disponivel_24h'],
                ]),
                'clinica' => $user->clinica()->create([
                    'cnpj' => $validated['cnpj'],
                    'nome_fantasia' => $validated['nome_fantasia'],
                    'razao_social' => $validated['razao_social'],
                    'endereco' => $validated['endereco'],
                    'telefone_principal' => $validated['telefone_principal'],
                    'telefone_emergencia' => $validated['telefone_emergencia'],
                    'email_contato' => $validated['email_contato'] ?? $validated['email'],
                    'horario_funcionamento' => $validated['horario_funcionamento'],
                    'disponivel_24h' => $validated['disponivel_24h'],
                    'localizacao' => $validated['localizacao'],
                ]),
            };

            event(new Registered($user));

            $token = JWTAuth::fromUser($user);

            $response = [
                'message' => 'Usuário criado com sucesso!',
                'usuario' => $user->load($user->tipo),
                'access_token' => $token,
                'token_type' => 'bearer',
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tipo' => $user->tipo,
            ];

            if ($user->tipo === 'clinica') $response['clinica_id'] = $user->clinica->id ?? null;
            if ($user->tipo === 'veterinario') $response['veterinario_id'] = $user->veterinario->id ?? null;
            if ($user->tipo === 'tutor') $response['tutor_id'] = $user->tutor->id ?? null;

            return response()->json($response, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'error' => 'Erro de validação',
                'messages' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:8',
        ]);

        try {
            if (!$token = JWTAuth::attempt($credentials)) {
                return response()->json(['message' => 'Credenciais inválidas.'], 401);
            }
        } catch (JWTException $e) {
            return response()->json(['message' => 'Erro ao gerar token.'], 500);
        }

        $user = auth()->user();

        $response = [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'tipo' => $user->tipo,
        ];

        if ($user->tipo === 'clinica') $response['clinica_id'] = $user->clinica->id ?? null;
        if ($user->tipo === 'veterinario') $response['veterinario_id'] = $user->veterinario->id ?? null;
        if ($user->tipo === 'tutor') $response['tutor_id'] = $user->tutor->id ?? null;

        return response()->json($response);
    }

    public function logout(Request $request)
    {
        try {
            $token = JWTAuth::getToken();
            if (!$token) return response()->json(['error' => 'Token ausente.'], 401);

            JWTAuth::invalidate($token);
            return response()->json(['message' => 'Logout realizado com sucesso.']);
        } catch (JWTException $e) {
            return response()->json(['message' => 'Falha ao deslogar.'], 500);
        }
    }

    public function me()
    {
        return response()->json(auth()->user());
    }
}
