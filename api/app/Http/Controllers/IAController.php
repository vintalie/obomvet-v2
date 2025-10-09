<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    public function transcribe(Request $request)
    {
        // 1️⃣ Validar tutor logado e obter pets
        [$tutor, $pets] = $this->getTutorAndPets($request);

        // 2️⃣ Transcrever áudio
        $transcription = $this->transcribeAudio($request->file('file'));

        // 3️⃣ Gerar prompt para autofill
        $prompt = $this->buildAutofillPrompt($tutor, $pets, $transcription);

        // 4️⃣ Enviar prompt para a IA
        return $this->sendPromptToAI($prompt);
    }

    /**
     * Obtém o tutor logado e seus pets.
     */
    private function getTutorAndPets(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->isTutor()) {
            abort(403, 'O usuário do tipo '.$user->tipo.' não pode criar uma emergência');
        }

        $tutor = $user->tutor;

        if (!$tutor) {
            abort(404, 'Tutor não encontrado para o usuário logado');
        }

        $pets = $tutor->pets ?? [];

        return [$tutor, $pets];
    }

    /**
     * Transcreve o áudio usando Whisper.
     */
    private function transcribeAudio($file)
    {
        if (!$file) {
            abort(400, 'Nenhum arquivo enviado');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->attach(
            'file', fopen($file->getRealPath(), 'r'), $file->getClientOriginalName()
        )->post('https://api.openai.com/v1/audio/transcriptions', [
            'model' => 'whisper-1',
        ]);

        return $response->json()['text'] ?? '';
    }

    /**
     * Monta o prompt para o autofill do formulário.
     */
    private function buildAutofillPrompt($tutor, $pets, $transcription)
    {
        $petsText = '';
        foreach ($pets as $pet) {
            $petsText .= "- nome: {$pet->nome}, especie: {$pet->especie}, raca: {$pet->raca}, data_nascimento: {$pet->data_nascimento}, peso: {$pet->peso}\n";
        }

        return "Você é um assistente que preenche formulários de emergência veterinária. 
O formulário possui os seguintes campos a serem preenchidos a partir do relato: 
- pet_id (selecionar entre os pets do tutor)
- descricao_sintomas
- visita_tipo
- nivel_urgencia

O tutor possui os seguintes dados:
- nome_completo: {$tutor->nome_completo}
- telefone_principal: {$tutor->telefone_principal}
- telefone_alternativo: {$tutor->telefone_alternativo}
- cpf: {$tutor->cpf}

Pets vinculados ao tutor:
$petsText

Transcrição do relato: \"$transcription\"

Retorne um JSON com duas chaves:
- \"preenchidos\": campos que você conseguiu identificar
- \"faltando\": campos que não estão claros no relato e precisam de confirmação do usuário

Responda apenas em JSON válido, sem comentários ou texto adicional.";
    }

    /**
     * Envia o prompt para a IA e retorna a resposta.
     */
    private function sendPromptToAI($prompt)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Você é um assistente que preenche formulários veterinários.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0,
        ]);

        return $response->json();
    }
}
