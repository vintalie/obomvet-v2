<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anexo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome_arquivo',
        'caminho',
        'tipo',
        'tamanho',
        'anexable_id',
        'anexable_type',
    ];

    // RELACIONAMENTO POLIMÓRFICO
    public function anexable()
    {
        return $this->morphTo();
    }
}
