<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'tipo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function tutor()
    {
        return $this->hasOne(Tutor::class);
    }

    public function veterinario()
    {
        return $this->hasOne(Veterinario::class);
    }

    public function isTutor()
    {
        return $this->tipo === 'tutor';
    }

    public function isVeterinario()
    {
        return $this->tipo === 'veterinario';
    }
}