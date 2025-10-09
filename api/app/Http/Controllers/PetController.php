<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Policies\PetPolicy;
use Orion\Http\Controllers\Controller;

class PetController extends Controller
{
   protected $model = Pet::class;
   protected $policy = PetPolicy::class;
   
}
