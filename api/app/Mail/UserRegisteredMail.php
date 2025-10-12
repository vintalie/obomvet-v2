<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserRegisteredMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;

    /**
     * Criar uma nova instância.
     */
    public function __construct($userName)
    {
        $this->userName = $userName;
    }

    /**
     * Construir a mensagem.
     */
    public function build()
    {
        return $this->subject('Confirmação de Registro')
                    ->markdown('emails.user.registered')
                    ->with([
                        'userName' => $this->userName
                    ]);
    }
}
