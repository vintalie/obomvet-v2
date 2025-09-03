<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuários tutores
        $tutores = [
            [
                'name' => 'João Silva',
                'email' => 'joao@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'tutor',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'tutor',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Carlos Oliveira',
                'email' => 'carlos@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'tutor',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Usuários veterinários
        $veterinarios = [
            [
                'name' => 'Dra. Ana Costa',
                'email' => 'ana.vet@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'veterinario',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Pedro Almeida',
                'email' => 'pedro.vet@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'veterinario',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dra. Fernanda Lima',
                'email' => 'fernanda.vet@email.com',
                'password' => Hash::make('senha123'),
                'tipo' => 'veterinario',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Inserir todos os usuários
        DB::table('users')->insert(array_merge($tutores, $veterinarios));
    }
}