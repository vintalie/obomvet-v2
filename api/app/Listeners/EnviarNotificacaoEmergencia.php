<?php

namespace App\Listeners;

use App\Events\NovaEmergencia;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use App\Models\Usuario;
use Illuminate\Support\Facades\Log;

class EnviarNotificacaoEmergencia
{
    public function handle(NovaEmergencia $event)
    {
        $emergencia = $event->emergencia;

        $payload = json_encode([
            'title' => '🚨 Nova Emergência!',
            'body' => $emergencia->descricao_sintomas ?? 'Um tutor relatou uma nova emergência.',
            'url' => '/dashboard/emergencias/' . $emergencia->id,
        ]);

        $usuarios = Usuario::whereNotNull('push_subscription')->get();

        if ($usuarios->isEmpty()) {
            Log::info("Nenhum usuário com subscription válida para WebPush.");
            return;
        }
//2025-10-30 09:55:33] local.ERROR: Erro WebPush (usuário 3): Unable to create the local key.  
//[2025-10-30 09:58:15] local.ERROR: There are no commands defined in the "generate" namespace. 
        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('webpush.vapid.public_key'),
                'privateKey' => config('webpush.vapid.private_key'),
            ],
        ]);

        foreach ($usuarios as $user) {
            try {
                $subscription = Subscription::create($user->push_subscription);
                $report = $webPush->sendOneNotification($subscription, $payload);

                if (!$report->isSuccess()) {
                    $statusCode = $report->getResponse()?->getStatusCode();
                    if (in_array($statusCode, [404, 410])) {
                        $user->push_subscription = null;
                        $user->save();
                        Log::warning("Subscription inválida removida para o usuário {$user->id}");
                    } else {
                        Log::error("Erro enviando WebPush para {$user->id}: " . $report->getReason());
                    }
                }
            } catch (\Exception $e) {
                Log::error("Erro WebPush (usuário {$user->id}): " . $e->getMessage());
            }
        }
    }
}
