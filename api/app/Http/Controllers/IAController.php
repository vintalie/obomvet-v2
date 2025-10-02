<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
     public function transcribe(Request $request)
    {
        $file = $request->file('file');

        if (!$file) {
            return response()->json(['error' => 'Nenhum arquivo enviado'], 400);
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->attach(
            'file', fopen($file->getRealPath(), 'r'), $file->getClientOriginalName()
        )->post('https://api.openai.com/v1/audio/transcriptions', [
            'model' => 'whisper-1',
        ]);

        return $response->json();
    }

}
