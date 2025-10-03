<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class AutenticadorController extends Controller
{
    public function register(Request $request){
        $registerUserData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'password' => 'required|string|min:8',
            'tipo' => 'required|in:tutor,veterinario,admin',
        ]);
        $user = Usuario::create([
            'name' => $registerUserData['name'],
            'email' => $registerUserData['email'],
            'password' => Hash::make($registerUserData['password']),
            'tipo' => $registerUserData['tipo'],
        ]);
        return response()->json([
            'message' => 'User Created ',
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
