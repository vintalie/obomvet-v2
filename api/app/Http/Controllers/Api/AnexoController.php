<?php

namespace App\Http\Controllers\Api;

use App\Models\Anexo;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnexoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Anexo::class, 'anexo');
    }

    public function index()
    {
        return Anexo::all();
    }

    public function store(Request $request)
    {
        return Anexo::create($request->all());
    }

    public function show(Anexo $anexo)
    {
        return $anexo;
    }

    public function update(Request $request, Anexo $anexo)
    {
        $anexo->update($request->all());
        return $anexo;
    }

    public function destroy(Anexo $anexo)
    {
        $anexo->delete();
        return response()->noContent();
    }

    public function getAnexable(Anexo $anexo)
    {
        return $anexo->anexable;
    }
}
