<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Orion\Http\Controllers\Controller;

class PetController extends Controller
{
   protected $model = Pet::class;
   
}
