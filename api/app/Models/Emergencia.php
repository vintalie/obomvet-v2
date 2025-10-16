<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Emergencia extends Model
{
    use HasFactory;

    protected $fillable = [
        'pet_id',
        'tutor_id',
        'veterinario_id',
        'descricao_sintomas',
        'visit_type',
        'nivel_urgencia',
        'status',
        'data_abertura',
        'data_conclusao',
        'diagnostico',
        'prescricao_medica',
        'custo_estimado',
        'localizacao'
    ];

    protected $casts = [
        'data_abertura' => 'datetime',
        'data_conclusao' => 'datetime',
    ];

    public function pet()
    {
        return $this->belongsTo(Pet::class);
    }

    public function tutor()
    {
        return $this->belongsTo(Tutor::class);
    }

    public function veterinario()
    {
        return $this->belongsTo(Veterinario::class);
    }

    public function historicoAtendimentos()
    {
        return $this->hasMany(HistoricoAtendimento::class);
    }
}
