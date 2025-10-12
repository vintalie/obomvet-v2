<?php

namespace App\Http\Controllers;

use App\Models\Anexo;
use App\Policies\AnexoPolicy;
use Orion\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnexoController extends Controller
{
   
   
   protected function beforeSave(Request $request, $anexable)
   {
      if ($request->hasFile('arquivo')) {
         $file = $request->file('arquivo');

         // Salvar o arquivo na pasta 'uploads' dentro do storage/app/public
         $path = $file->store('uploads', 'public');

         // Atualizar os campos do Request
         $request->merge([
               'nome_arquivo'   => $file->getClientOriginalName(),
               'caminho'        => $path, // caminho relativo para Storage::url()
               'tipo'           => $file->getClientOriginalExtension(),
               'tamanho'        => $file->getSize(),
               'anexable_id'    => $anexable->id,
               'anexable_type'  => get_class($anexable),
         ]);
      }
   }
   protected $model = Anexo::class;
   protected $policy = AnexoPolicy::class;
   
   
}
