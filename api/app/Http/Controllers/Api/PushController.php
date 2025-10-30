<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class PushController extends Controller {
    public function store(Request $request) {
        // salva no banco a subscription JSON
    }

    public function send() {
        $subscription = Subscription::create([
            'endpoint' => '...',
            'keys' => [
                'p256dh' => '...',
                'auth' => '...',
            ],
        ]);
        $webPush = new WebPush(['VAPID' => [
            'subject' => 'mailto:contato@obomvet.com',
            'publicKey' => env('VAPID_PUBLIC_KEY'),
            'privateKey' => env('VAPID_PRIVATE_KEY'),
        ]]);
        $webPush->sendNotification($subscription, json_encode(['title' => '🚨 Nova Emergência!']));
    }
}
