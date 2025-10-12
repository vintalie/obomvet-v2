<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Usuario extends Authenticatable implements MustVerifyEmail
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
    public function clinica()
    {
        return $this->hasOne(Clinica::class);
    }

    public function isTutor()
    {
        return $this->tipo === 'tutor';
    }
    public function fotoPerfil()
    {
        return $this->morphOne(Anexo::class, 'anexable');
    }
    public function isVeterinario()
    {
        return $this->tipo === 'veterinario';
    }
    public function isClinica()
    {
        return $this->tipo === 'clinica';
    }
}