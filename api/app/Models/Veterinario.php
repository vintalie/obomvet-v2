<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Veterinario extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nome_completo',
        'crmv',
        'localizacao',
        'especialidade',
        'telefone_emergencia',
        'disponivel_24h',
    ];

    protected $casts = [
        'disponivel_24h' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(Usuario::class);
    }

    public function emergencias()
    {
        return $this->hasMany(Emergencia::class);
    }

    public function historicoAtendimentos()
    {
        return $this->hasMany(HistoricoAtendimento::class);
    }
}