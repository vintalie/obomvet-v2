<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use App\Policies\TutorPolicy;
use Orion\Concerns\DisableAuthorization;
use Orion\Http\Controllers\Controller;

class TutorController extends Controller
{
// use DisableAuthorization;
   protected $model = Tutor::class;
   protected $policy = TutorPolicy::class;
   
}
