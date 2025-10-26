<?php

namespace App\Http\Controllers\Api;

use App\Models\Pet;
use App\Events\NovaEmergencia;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Pet::class, 'pet');
    }

    public function index()
    {
        return Pet::all();
    }

    public function store(Request $request)
    {
        return Pet::create($request->all());
    }

    public function show(Pet $pet)
    {
        return $pet;
    }

    public function update(Request $request, Pet $pet)
    {
        $pet->update($request->all());
        return $pet;
    }

    public function destroy(Pet $pet)
    {
        $pet->delete();
        return response()->noContent();
    }

    public function getTutors(Pet $pet)
    {
        return $pet->tutors()->get();
    }

    public function getEmergencias(Pet $pet)
    {
        return $pet->emergencias()->get();
    }

    public function storeEmergencia(Request $request, Pet $pet)
    {
        $emergencia = $pet->emergencias()->create($request->all());

        // Dispara a notificação push via Pusher
        NovaEmergencia::dispatch($emergencia);
        return response()->json($emergencia, 201);
    }

    public function storeProntuario(Request $request, Pet $pet)
    {
        $prontuario = $pet->prontuarios()->create($request->all());
        return response()->json($prontuario, 201);
    }

    public function getProntuarios(Pet $pet)
    {
        return $pet->prontuarios()->get();
    }

    public function getFoto(Pet $pet)
    {
        return $pet->fotoPet;
    }
}
