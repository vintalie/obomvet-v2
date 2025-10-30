<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    // use DisableAuthorization;

    /**
     * Autorização para uso público (chave secreta)
     */
    private function authorizePublic(Request $request)
    {
        $key = $request->header('X-PUBLIC-IA-KEY') ?? $request->input('key');
        if (!$key || $key !== env('PUBLIC_IA_KEY')) {
            abort(403, 'Acesso negado.');
        }
    }

    /**
     * Transcrição para usuários logados
     */
    public function transcribeUnified(Request $request)
{
    // Se não estiver logado, checa chave pública
    if (!$request->user()) {
        $this->authorizePublic($request);
    }

    [$tutor, $pets] = $this->getTutorAndPets($request);
    $transcription = $this->transcribeAudio($request->file('file'));
    $prompt = $this->buildAutofillPrompt($tutor, $pets, $transcription);

    return $this->sendPromptToAI($prompt);
}

public function analyzeTextUnified(Request $request)
{
    if (!$request->user()) {
        $this->authorizePublic($request);
    }

    $request->validate(['text' => 'required|string']);
    [$tutor, $pets] = $this->getTutorAndPets($request);
    $text = $request->input('text');
    $prompt = $this->buildAutofillPrompt($tutor, $pets, $text);

    return $this->sendPromptToAI($prompt);
}


    /**
     * Obtém tutor e pets
     */
    private function getTutorAndPets(Request $request)
    {
        $user = $request->user();
        if ($user && $user->tipo === 'tutor') {
            $tutor = $user->tutor;
            $pets = $tutor ? ($tutor->pets ?? collect()) : collect();
            return [$tutor, $pets];
        }
        return [null, collect()];
    }

    /**
     * Transcreve áudio via Whisper
     */
    private function transcribeAudio($file)
    {
        if (!$file) abort(400, 'Nenhum arquivo enviado.');

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->attach(
            'file',
            fopen($file->getRealPath(), 'r'),
            $file->getClientOriginalName()
        )->post('https://api.openai.com/v1/audio/transcriptions', [
            'model' => 'whisper-1',
        ]);

        return $response->json()['text'] ?? '';
    }

    /**
     * Monta prompt
     */
    private function buildAutofillPrompt($tutor, $pets, $transcription)
    {
        $tutorLogado = $tutor ? 'sim' : 'não';
        $temPet = ($pets && count($pets) > 0) ? 'sim' : 'não';

        $petsText = '';
        foreach ($pets as $pet) {
            $petsText .= "- nome: {$pet->nome}, especie: {$pet->especie}, raca: {$pet->raca}, data_nascimento: {$pet->data_nascimento}, peso: {$pet->peso}\n";
        }

        $tutorText = $tutor ? "- nome: {$tutor->nome_completo}, telefone: {$tutor->telefone_principal}, cpf: {$tutor->cpf}" : "nenhum";

        return <<<PROMPT
Você é um assistente de triagem para emergências veterinárias.

Receberá:
- Um relato textual transcrito (pode ter vindo de áudio)
- Informações do tutor logado (se houver)
- Lista de pets cadastrados (pode estar vazia)

Tarefas:
1. Se o tutor **não estiver logado**, extraia do relato:
   - nome do tutor,
   - telefone para contato,
   - nome, espécie e idade do animal.

2. Se o tutor estiver logado, use seus dados.  
   Se ele **não tiver pets**, extraia do relato as informações do animal.

3. Analise o relato e identifique:
   - tipo de emergência (ex: atropelamento, intoxicação, sangramento, febre)
   - nível de urgência (alta, média, baixa)
   - ação recomendada imediata (ex: levar à clínica, manter aquecido, oferecer água)

4. Retorne um JSON **válido** e estruturado assim:
{
  "tutor": {
    "nome": "...",
    "telefone": "..."
  },
  "animal": {
    "nome": "...",
    "especie": "...",
    "idade": "...",
    "tem_cadastro": true
  },
  "emergencia": {
    "tipo": "...",
    "urgencia": "...",
    "acao_recomendada": "..."
  }
}

Tutor logado: {$tutorLogado}
Tutor tem pet cadastrado: {$temPet}

Dados do tutor logado (se houver):
{$tutorText}

Pets cadastrados:
{$petsText}

Relato transcrito:
"{$transcription}"
PROMPT;
    }

    /**
     * Envia prompt para API da OpenAI
     */
    private function sendPromptToAI($prompt)
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('OPENAI_API_KEY'),
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => [
                ['role' => 'system', 'content' => 'Você é um assistente que interpreta relatos de emergência veterinária e retorna JSON estruturado.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.3,
        ]);

        return $response->json();
    }
}
