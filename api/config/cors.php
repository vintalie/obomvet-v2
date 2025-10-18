<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'broadcasting/auth'],
    
    'allowed_origins' => ['http://localhost:5173'],
    
    'allowed_methods' => ['*'],
    
    'allowed_headers' => ['*'],
    
    'supports_credentials' => true,
    
    'allowed_origins_patterns' => [],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
