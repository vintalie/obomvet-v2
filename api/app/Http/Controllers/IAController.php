<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    // Endpoint para transcrever áudio
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

    // Novo endpoint para analisar texto
    public function analyzeText(Request $request)
    {
        $text = $request->input('text');

        if (!$text) {
            return response()->json(['error' => 'Nenhum texto enviado'], 400);
        }

        $response = Http::withHeaders([
    'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
])->post('https://api.openai.com/v1/chat/completions', [
    'model' => 'gpt-4',
    'messages' => [
        [
            'role' => 'system',
            'content' => 'Responda **somente** com JSON válido. Formato: { "preenchidos": {...}, "faltando": [...] }',
        ],
        [
            'role' => 'user',
            'content' => $text,
        ],
    ],
]);

        return $response->json();
    }
}
