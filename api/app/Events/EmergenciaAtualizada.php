<?php

namespace App\Events;

use App\Models\Emergencia;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class EmergenciaAtualizada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $emergencia;

    /**
     * Cria uma nova instância do evento.
     */
    public function __construct(Emergencia $emergencia)
    {
        $this->emergencia = $emergencia->load(['tutor', 'clinica', 'pet']);
    }

    /**
     * Canal de broadcast — envia para canais privados da clínica e do tutor.
     */
    public function broadcastOn()
    {
        return [
            new Channel('emergencias.clinica.' . $this->emergencia->clinica_id),
            new Channel('emergencias.tutor.' . $this->emergencia->tutor_id),
        ];
    }

    /**
     * Nome do evento no frontend (ouvinte no Pusher/Echo).
     */
    public function broadcastAs()
    {
        return 'EmergenciaAtualizada';
    }

    /**
     * Dados enviados no broadcast.
     */
    public function broadcastWith()
    {
        return [
            'id' => $this->emergencia->id,
            'status' => $this->emergencia->status,
            'visita_tipo' => $this->emergencia->visita_tipo,
            'descricao_sintomas' => $this->emergencia->descricao_sintomas,
            'clinica' => [
                'id' => $this->emergencia->clinica->id ?? null,
                'nome' => $this->emergencia->clinica->nome_fantasia ?? 'Clínica',
            ],
            'tutor' => [
                'id' => $this->emergencia->tutor->id ?? null,
                'nome' => $this->emergencia->tutor->nome ?? 'Tutor',
            ],
            'pet' => [
                'id' => $this->emergencia->pet->id ?? null,
                'nome' => $this->emergencia->pet->nome ?? null,
            ],
            'data_conclusao' => $this->emergencia->data_conclusao,
            'updated_at' => $this->emergencia->updated_at,
        ];
    }
}
