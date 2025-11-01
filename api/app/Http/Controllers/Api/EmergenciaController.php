<?php

namespace App\Http\Controllers\Api;

use App\Models\Emergencia;
use App\Models\Clinica;
use App\Models\Tutor;
use App\Models\Veterinario;
use App\Events\NovaEmergencia;
use App\Events\EmergenciaAtualizada;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EmergenciaController extends Controller
{
    /**
     * Construtor - Proteção e políticas futuras
     */
    public function __construct()
    {
        // $this->authorizeResource(Emergencia::class, 'emergencia');
    }

    /**
     * Função privada para calcular a distância Haversine em km.
     */
    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) ** 2 +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $earthRadius * $c;
    }

    /**
     * Função privada para preencher latitude e longitude dinamicamente
     */
    private function adicionarCoordenadas(Emergencia $emg)
    {
        if (isset($emg->localizacao)) {
            $coords = explode(',', $emg->localizacao);
            $emg->latitude = isset($coords[0]) ? (float) str_replace('L:', '', $coords[0]) : null;
            $emg->longitude = isset($coords[1]) ? (float) str_replace('G:', '', $coords[1]) : null;
        } else {
            $emg->latitude = null;
            $emg->longitude = null;
        }
        return $emg;
    }

    // ============================================================
    // 🔹 CRUD BÁSICO
    // ============================================================

    public function index()
    {
        $emergencias = Emergencia::with(['pet', 'tutor', 'clinica'])->get();
        return response()->json($emergencias->map(fn($e) => $this->adicionarCoordenadas($e)));
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->tutor) {
            return response()->json(['error' => 'Usuário tutor não autenticado'], 401);
        }

        $validated = $request->validate([
            'descricao_sintomas' => 'required|string',
            'nivel_urgencia' => 'required|in:baixa,media,alta,critica',
            'visita_tipo' => 'required|in:clinica,domicilio',
            'pet_id' => 'required|exists:pets,id',
            'location' => 'nullable|array',
            'location.latitude' => 'required_with:location|numeric',
            'location.longitude' => 'required_with:location|numeric',
        ]);

        $validated['tutor_id'] = $user->tutor->id;

        $userLocation = $request->input('location');
        $clinicaAlvo = null;

        $todasClinicas = Clinica::all();
        if ($todasClinicas->isEmpty()) {
            return response()->json(['error' => 'Nenhuma clínica cadastrada no sistema'], 400);
        }

        if ($userLocation) {
            $userLat = (float) $userLocation['latitude'];
            $userLon = (float) $userLocation['longitude'];

            $clinicaMaisProxima = null;
            $distanciaMinima = PHP_INT_MAX;

            foreach ($todasClinicas as $clinica) {
                $coords = explode(',', $clinica->localizacao);
                if (count($coords) !== 2) continue;

                $clinicLat = (float) str_replace('L:', '', $coords[0]);
                $clinicLon = (float) str_replace('G:', '', $coords[1]);
                $distancia = $this->haversineDistance($userLat, $userLon, $clinicLat, $clinicLon);

                if ($distancia < $distanciaMinima) {
                    $distanciaMinima = $distancia;
                    $clinicaMaisProxima = $clinica;
                }
            }

            $clinicaAlvo = $clinicaMaisProxima;
        } else {
            $clinicaAlvo = $todasClinicas->first();
        }

        $validated['clinica_id'] = $clinicaAlvo->id;
        unset($validated['location']);

        $validated['status'] = 'pendente';
        $validated['data_abertura'] = now();

        $emergencia = Emergencia::create($validated);

        NovaEmergencia::dispatch($emergencia);

        return response()->json([
            'emergencia' => $this->adicionarCoordenadas($emergencia),
            'clinica' => $clinicaAlvo
        ], 201);
    }

    public function show(Emergencia $emergencia)
    {
        return response()->json($this->adicionarCoordenadas($emergencia->load(['pet', 'tutor', 'clinica'])));
    }

    public function destroy(Emergencia $emergencia)
    {
        $emergencia->delete();
        return response()->noContent();
    }

    // ============================================================
    // 🔹 FUNÇÕES DE GESTÃO
    // ============================================================

    public function updateStatus(Request $request, Emergencia $emergencia)
    {
        $user = $request->user();
        if (!$user || !$user->clinica) {
            return response()->json(['error' => 'Apenas clínicas podem alterar o status.'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pendente,em_andamento,finalizada,cancelada'
        ]);

        $emergencia->status = $validated['status'];
        if ($emergencia->status === 'finalizada') {
            $emergencia->data_conclusao = now();
        }
        $emergencia->save();

        EmergenciaAtualizada::dispatch($emergencia);

        return response()->json([
            'message' => 'Status atualizado com sucesso',
            'emergencia' => $this->adicionarCoordenadas($emergencia)
        ]);
    }

    public function aceitarEmergencia(Request $request, Emergencia $emergencia)
    {
        $user = $request->user();
        if (!$user || !$user->clinica) {
            return response()->json(['error' => 'Apenas clínicas podem aceitar emergências.'], 403);
        }

        $emergencia->update([
            'status' => 'em_andamento',
            'clinica_id' => $user->clinica->id
        ]);

        EmergenciaAtualizada::dispatch($emergencia);

        return response()->json([
            'message' => 'Emergência aceita com sucesso!',
            'emergencia' => $this->adicionarCoordenadas($emergencia)
        ]);
    }

    public function gerarRota(Request $request, Emergencia $emergencia)
    {
        $clinica = $emergencia->clinica;
        $tutor = $emergencia->tutor;

        if (!$clinica || !$tutor) {
            return response()->json(['error' => 'Dados incompletos para gerar rota.'], 400);
        }

        if ($emergencia->visita_tipo !== 'domicilio') {
            return response()->json(['error' => 'A rota só é gerada para visitas domiciliares.'], 400);
        }

        $clinicaCoords = explode(',', $clinica->localizacao);
        $clinicLat = (float) str_replace('L:', '', $clinicaCoords[0]);
        $clinicLon = (float) str_replace('G:', '', $clinicaCoords[1]);

        $coordsTutor = explode(',', $emergencia->localizacao);
        $tutorLat = (float) str_replace('L:', '', $coordsTutor[0]);
        $tutorLon = (float) str_replace('G:', '', $coordsTutor[1]);

        $rotaUrl = "https://www.google.com/maps/dir/{$clinicLat},{$clinicLon}/{$tutorLat},{$tutorLon}";

        return response()->json([
            'rota_url' => $rotaUrl,
            'message' => 'Rota gerada com sucesso.'
        ]);
    }

    public function atribuirVeterinario(Request $request, Emergencia $emergencia)
    {
        $request->validate(['veterinario_id' => 'required|exists:veterinarios,id']);

        $emergencia->update([
            'veterinario_id' => $request->veterinario_id,
            'status' => 'em_andamento'
        ]);

        EmergenciaAtualizada::dispatch($emergencia);

        return response()->json([
            'message' => 'Veterinário atribuído com sucesso',
            'emergencia' => $this->adicionarCoordenadas($emergencia)
        ]);
    }

    public function cancelar(Request $request, Emergencia $emergencia)
    {
        $request->validate(['motivo' => 'required|string']);

        $emergencia->update([
            'status' => 'cancelada',
            'diagnostico' => 'Cancelada: ' . $request->motivo
        ]);

        EmergenciaAtualizada::dispatch($emergencia);

        return response()->json([
            'message' => 'Emergência cancelada',
            'emergencia' => $this->adicionarCoordenadas($emergencia)
        ]);
    }

    // ============================================================
    // 🔹 CONSULTAS E LISTAGENS
    // ============================================================

    public function meus(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->tutor) {
            return response()->json(['error' => 'Usuário não é tutor'], 403);
        }

        $emergencias = Emergencia::with('pet')
            ->where('tutor_id', $user->tutor->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($emg) => $this->adicionarCoordenadas($emg));

        return response()->json($emergencias);
    }

    public function porClinica(Request $request)
    {
        $user = $request->user();
        if (!$user || !$user->clinica) {
            return response()->json(['error' => 'Usuário não é uma clínica autenticada.'], 403);
        }

        $emergencias = Emergencia::with(['pet', 'tutor'])
            ->where('clinica_id', $user->clinica->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($emg) => $this->adicionarCoordenadas($emg));

        return response()->json($emergencias);
    }
}
