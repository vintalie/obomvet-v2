<?php

namespace App\Http\Controllers;

use Orion\Concerns\DisableAuthorization;
use App\Models\Usuario;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AutenticadorController extends UsuarioController
{
// use DisableAuthorization;
    public function register(Request $request)
    {
        $registerUserData = [];
        $userData = [];

        switch ($request->tipo) {
            case 'tutor':
                $registerUserData = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:tutor',
                    'nome_completo' => 'required|string|max:255',
                    'telefone_principal' => 'required|string|max:20',
                    'telefone_alternativo' => 'nullable|string|max:20',
                    'cpf' => 'required|string|size:11|unique:tutors,cpf',
                ]);
                break;

            case 'veterinario':
                $registerUserData = $request->validate([
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
                ]);
                break;

            case 'clinica':
                $registerUserData = $request->validate([
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
                ]);
                break;

            default:
                return response()->json([
                    'message' => 'Tipo de usuário inválido.'
                ], 422);
        }

        $user = Usuario::create([
            'name' => $registerUserData['name'],
            'email' => $registerUserData['email'],
            'password' => Hash::make($registerUserData['password']),
            'tipo' => $registerUserData['tipo'],
        ]);

        switch ($request->tipo) {
            case 'tutor':
                $userData = $user->tutor()->create([
                    'nome_completo' => $registerUserData['nome_completo'],
                    'telefone_principal' => $registerUserData['telefone_principal'],
                    'telefone_alternativo' => $registerUserData['telefone_alternativo'] ?? null,
                    'cpf' => $registerUserData['cpf']
                ]);
                break;

            case 'veterinario':
                $userData = $user->veterinario()->create([
                    'nome_completo' => $registerUserData['nome_completo'],
                    'crmv' => $registerUserData['crmv'],
                    'localizacao' => $registerUserData['localizacao'],
                    'especialidade' => $registerUserData['especialidade'],
                    'telefone_emergencia' => $registerUserData['telefone_emergencia'],
                    'disponivel_24h' => $registerUserData['disponivel_24h'],
                ]);
                break;

            case 'clinica':
                $userData = $user->clinica()->create([
                    'cnpj' => $registerUserData['cnpj'],
                    'nome_fantasia' => $registerUserData['nome_fantasia'],
                    'razao_social' => $registerUserData['razao_social'],
                    'endereco' => $registerUserData['endereco'],
                    'telefone_principal' => $registerUserData['telefone_principal'],
                    'telefone_emergencia' => $registerUserData['telefone_emergencia'],
                    'email_contato' => $registerUserData['email_contato'] ?? $registerUserData['email'],
                    'horario_funcionamento' => $registerUserData['horario_funcionamento'],
                    'disponivel_24h' => $registerUserData['disponivel_24h'],
                    'localizacao' => $registerUserData['localizacao']
                ]);
                break;
        }

        event(new Registered($user));
        
        return response()->json([
            'message' => 'User Created',
            'usuario' => $user->with($user->tipo)->find($user->id),
        ], 201);
    }

     public function login(Request $request){
        $loginUserData = $request->validate([
            'email'=>'required|string|email',
            'password'=>'required|min:8'
        ]);
        $user = Usuario::where('email',$loginUserData['email'])->first();
        if(!$user || !Hash::check($loginUserData['password'],$user->password)){
            return response()->json([
                'message' => 'Invalid Credentials'
            ],401);
        }
        $token = $user->createToken($user->name.'-AuthToken', [$user->tipo])->plainTextToken;

        $response = [
            'access_token' => $token,
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'tipo' => $user->tipo,
        ];

        if($user->tipo == 'clinica'){
            $response['clinica_id'] = $user->clinica->id;
        }
        if($user->tipo == 'veterinario'){
            $response['veterinario_id'] = $user->veterinario->id;
            
        }
        if($user->tipo == 'tutor'){
            $response['tutor_id'] = $user->tutor->id;
            
        }

        return response()->json($response);

        
    }
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json([
        "message"=>"logged out"
        ]);
    }
}
