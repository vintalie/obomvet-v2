<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pet extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'especie',
        'raca',
        'data_nascimento',
        'peso',
        'alergias',
        'medicamentos_continuos',
        'cuidados_especiais',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
    ];

    public function tutors()
    {
        return $this->belongsToMany(Tutor::class, 'tutor_pet');
    }

    public function emergencias()
    {
        return $this->hasMany(Emergencia::class);
    }
}