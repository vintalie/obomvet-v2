<?php

namespace App\Http\Controllers;

use App\Models\Tutor;
use App\Policies\TutorPolicy;
use Orion\Http\Controllers\Controller;

class TutorController extends Controller
{
   protected $model = Tutor::class;
   protected $policy = TutorPolicy::class;
   
}
