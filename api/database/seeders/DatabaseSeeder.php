<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario; // 👈 substitui o antigo "User"
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Cria um usuário de teste
        Usuario::create([
    'name' => 'Usuário Teste', // 👈 adiciona isso
    'nome_completo' => 'Usuário Teste',
    'email' => 'test@example.com',
    'password' => Hash::make('password123'),
    'tipo' => 'tutor',
    
    'telefone_principal' => '11999999999',
]);

    }
}
