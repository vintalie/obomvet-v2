@component('mail::message')
# Olá {{ $userName }}!

Obrigado por se cadastrar na plataforma **Obomvet**.

Clique no botão abaixo para confirmar seu e-mail e ativar sua conta:

@component('mail::button', ['url' => $verificationUrl])
Confirmar E-mail
@endcomponent

Se você não se cadastrou, pode ignorar este e-mail.

Obrigado,<br>
{{ config('app.name') }}
@endcomponent
