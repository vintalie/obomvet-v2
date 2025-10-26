<?php

namespace App\Events;

use App\Models\Emergencia;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NovaEmergencia
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $emergencia;

    public function __construct(Emergencia $emergencia)
    {
        $this->emergencia = $emergencia;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('emergencias');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->emergencia->id,
            'descricao' => $this->emergencia->descricao,
            'criado_em' => $this->emergencia->created_at,
        ];
    }
}
