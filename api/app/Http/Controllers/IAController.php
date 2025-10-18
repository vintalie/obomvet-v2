<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    // Analisar texto via IA
    public function analyzeText(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
        ]);

        $inputText = $request->text;

        try {
            // Exemplo: chamada para OpenAI ou outro serviço de IA
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'Responda sempre em JSON com preenchidos e faltando'
                    ],
                    [
                        'role' => 'user',
                        'content' => "Analise o texto do relatório: \"$inputText\" e retorne JSON como:
                        {
                          \"preenchidos\": {\"descricao_sintomas\": \"...\", \"nivel_urgencia\": \"...\"},
                          \"faltando\": [\"campo1\", \"campo2\"]
                        }"
                    ]
                ],
                'temperature' => 0,
            ]);

            $body = $response->json();

            // Tenta extrair JSON do conteúdo da IA
            $content = $body['choices'][0]['message']['content'] ?? '';

            // Garantir retorno JSON válido
            $parsed = json_decode($content, true);
            if (!$parsed) {
                $parsed = [
                    'preenchidos' => [],
                    'faltando' => [],
                ];
            }

            return response()->json($parsed);
        } catch (\Exception $e) {
            return response()->json([
                'preenchidos' => [],
                'faltando' => [],
                'error' => $e->getMessage(),
            ]);
        }
    }
}
