<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Events\WebRTCSignal;

class WebRTCController extends Controller
{
public function signal(Request $request)
{
    broadcast(new WebRTCSignal($request->target, $request->signal));
    return response()->json(['success' => true]);
}
}
