<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoricoAtendimento extends Model
{
    use HasFactory;

    protected $fillable = [
        'emergencia_id',
        'veterinario_id',
        'acao_realizada',
        'data_acao',
    ];

    protected $casts = [
        'data_acao' => 'datetime',
    ];

    public function emergencia()
    {
        return $this->belongsTo(Emergencia::class);
    }

    public function veterinario()
    {
        return $this->belongsTo(Veterinario::class);
    }
}