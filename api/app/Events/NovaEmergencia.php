<?php

namespace App\Events;

use App\Models\Emergencia;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NovaEmergencia implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $emergencia;

    public function __construct(Emergencia $emergencia)
    {
         $this->emergencia = $emergencia;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('clinicas');
    }
    public function broadcastAs() 
    { 
        return 'NovaEmergencia'; 
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->emergencia->id,
            'descricao_sintomas' => $this->emergencia->descricao_sintomas,
            'criado_em' => $this->emergencia->created_at,
        ];
    }
}
