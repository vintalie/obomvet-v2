<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class WebRTCSignal implements ShouldBroadcastNow
{
    public $target;
    public $signalData;

    public function __construct($target, $signalData)
    {
        $this->target = $target;
        $this->signalData = $signalData;
    }

    public function broadcastOn()
    {
        return new PrivateChannel("webrtc.{$this->target}");
    }

    public function broadcastAs()
    {
        return 'WebRTCSignal';
    }
}
