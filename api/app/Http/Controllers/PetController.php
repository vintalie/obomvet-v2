<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Policies\PetPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PetController extends Controller
{
// use DisableAuthorization;

   
    /**
     * Modelo e política associados ao Orion
     */
    protected $model = Pet::class;
    protected $policy = PetPolicy::class;

}
