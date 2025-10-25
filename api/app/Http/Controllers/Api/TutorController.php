<?php

namespace App\Http\Controllers\Api;

use App\Models\Tutor;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TutorController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Tutor::class, 'tutor');
    }

    public function index()
    {
        return Tutor::all();
    }

    public function store(Request $request)
    {
        return Tutor::create($request->all());
    }

    public function show(Tutor $tutor)
    {
        return $tutor;
    }

    public function update(Request $request, Tutor $tutor)
    {
        $tutor->update($request->all());
        return $tutor;
    }

    public function destroy(Tutor $tutor)
    {
        $tutor->delete();
        return response()->noContent();
    }

    public function getPets(Tutor $tutor)
    {
        return $tutor->pets()->get();
    }

    public function getEmergencias(Tutor $tutor)
    {
        return $tutor->emergencias()->get();
    }

    public function storePet(Request $request, Tutor $tutor)
    {
        $pet = $tutor->pets()->create($request->all());
        return response()->json($pet, 201);
    }
}
