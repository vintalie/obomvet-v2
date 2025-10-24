<?php

namespace App\Http\Controllers\Api;
use Illuminate\Database\Eloquent\Model;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AnexoController extends Controller
{
    public function index() { return Model::all(); }
    public function store(Request $request) { return Model::create($request->all()); }
    public function show(Model $model) { return $model; }
    public function update(Request $request, Model $model) { $model->update($request->all()); return $model; }
    public function destroy(Model $model) { $model->delete(); return response()->noContent(); }

}
