<?php

namespace App\Events;

use App\Models\Emergencia;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;


class EmergenciaCriada implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $emergencia;

    public function __construct(Emergencia $emergencia)
    {
        $this->emergencia = $emergencia->load('pet', 'tutor');
    }

    public function broadcastOn()
    {
        // Canal privado para veterinários
        return new PrivateChannel('veterinarios');
    }

    public function broadcastAs()
    {
        return 'nova-emergencia';
    }
}