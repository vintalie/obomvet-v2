<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AutenticadorController extends Controller
{
    public function register(Request $request){
        $registerUserData = [];
        $userData = [];
        
        switch ($request->tipo) {
            case 'tutor':
                $registerUserData = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:tutor,veterinario,admin',
                    'nome_completo' => 'required|string|max:255',
                    'telefone_principal' => 'required|string|max:20',
                    'telefone_alternativo' => 'nullable|string|max:20',
                    'cpf' => 'required|string|size:11|unique:tutores,cpf',
                ]);
                break;
            case 'veterinario':
                $registerUserData = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:tutor,veterinario,admin',
                    'crmv' => 'required|string|unique:veterinarios,crmv',
                    'nome_completo' => 'required|string|max:255',
                    'localizacao' => 'required|string|max:255',
                    'especialidade' => 'required|string|max:255',
                    'telefone_emergencia' => 'required|string|max:20',
                    'disponivel_24h' => 'required|boolean',
                ]);
                break;
            default:
                $registerUserData = $request->validate([
                    'name' => 'required|string|max:255',
                    'email' => 'required|string|email|max:255|unique:usuarios',
                    'password' => 'required|string|min:8',
                    'tipo' => 'required|in:tutor,veterinario,admin',
                ]);
                break;
        }




        $user = Usuario::create([
            'name' => $registerUserData['name'],
            'email' => $registerUserData['email'],
            'password' => Hash::make($registerUserData['password']),
            'tipo' => $registerUserData['tipo'],
        ]);

        
        
        if($request->tipo == 'tutor'){
            $userData = $user->tutor()->create([
                    'nome_completo' => $registerUserData['nome_completo'],
                    'telefone_principal' => $registerUserData['telefone_principal'],
                    'telefone_alternativo' => $registerUserData['telefone_alternativo'] ?? null,
                    'cpf' => $registerUserData['cpf']
                ]
            );
        } elseif ($request->tipo == 'veterinario'){
            $userData = $user->veterinario()->create([
                    'nome_completo' => $registerUserData['nome_completo'],
                    'crmv' => $registerUserData['crmv'],
                    'localizacao' => $registerUserData['localizacao'],
                    'especialidade' => $registerUserData['especialidade'],
                    'telefone_emergencia' => $registerUserData['telefone_emergencia'],
                    'disponivel_24h' => $registerUserData['disponivel_24h'],
            ]);

        }
        return response()->json([
            'message' => 'User Created',
            'usuario' => $user->with($user->tipo)->find($user->id),
        ]);
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
        return response()->json([
            'access_token' => $token,
        ]);

        
    }
    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->json([
        "message"=>"logged out"
        ]);
    }
}
