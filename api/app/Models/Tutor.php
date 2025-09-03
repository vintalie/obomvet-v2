<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nome_completo',
        'telefone_principal',
        'telefone_alternativo',
        'cpf',
    ];

    public function user()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function pets()
    {
        return $this->belongsToMany(Pet::class, 'tutor_pet');
    }

    public function emergencias()
    {
        return $this->hasMany(Emergencia::class);
    }
}