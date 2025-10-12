<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class IAController extends Controller
{
    public function transcribe(Request $request)
    {
        // 1️⃣ Tentar obter tutor logado (se existir)
        [$tutor, $pets] = $this->getTutorAndPets($request);

        // 2️⃣ Transcrever o áudio
        $transcription = $this->transcribeAudio($request->file('file'));

        // 3️⃣ Criar prompt inteligente
        $prompt = $this->buildAutofillPrompt($tutor, $pets, $transcription);

        // 4️⃣ Enviar prompt para a IA
        return $this->sendPromptToAI($prompt);
    }

    /**
     * Obtém o tutor logado e seus pets (se houver).
     * Permite também usuário deslogado.
     *
     * @return array [$tutor|null, Collection|array $pets]
     */
    private function getTutorAndPets(Request $request)
    {
        $user = $request->user();

        if ($user && $user->tipo === 'tutor') {
            $tutor = $user->tutor;
            // garante que $pets seja iterável (Collection ou array)
            $pets = $tutor ? ($tutor->pets ?? collect()) : collect();
            return [$tutor, $pets];
        }

        // Se o usuário não estiver logado ou não for tutor, retorna nulos/vazio
        return [null, collect()];
    }

    /**
     * Transcreve o áudio via API Whisper.
     *
     * @param \Illuminate\Http\UploadedFile|null $file
     * @return string
     */
    private function transcribeAudio($file)
    {
        if (!$file) {
            abort(400, 'Nenhum arquivo enviado.');
        }

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
     * Monta o prompt com base no contexto e transcrição.
     */
    private function buildAutofillPrompt($tutor, $pets, $transcription)
    {
        $tutorLogado = $tutor ? 'sim' : 'não';
        $temPet = ($pets && count($pets) > 0) ? 'sim' : 'não';

        // monta texto dos pets
        $petsText = '';
        foreach ($pets as $pet) {
            $petsText .= "- nome: {$pet->nome}, especie: {$pet->especie}, raca: {$pet->raca}, data_nascimento: {$pet->data_nascimento}, peso: {$pet->peso}\n";
        }

        // monta texto resumido do tutor (fora do heredoc para evitar interpolação complexa)
        if ($tutor) {
            $tutorText = "- nome: {$tutor->nome_completo}, telefone: {$tutor->telefone_principal}, cpf: {$tutor->cpf}";
        } else {
            $tutorText = "nenhum";
        }

        // usa heredoc com variáveis simples (sem expressões ternárias dentro)
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
     * Envia o prompt para a API da OpenAI.
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
