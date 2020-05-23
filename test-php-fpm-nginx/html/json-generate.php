<?php

require('php-jwt/src/JWTException.php');
require('php-jwt/src/ValidatesJWT.php');
require('php-jwt/src/JWT.php');

$jwt = new Ahc\Jwt\JWT("lua-resty-jwt", 'HS256', 3600, 10);

$token = $jwt->encode([
    'name'      => 'customer1',
    'tenant'    => 'mytenant',
    'iat'       => time(),
    'id'        => 'a7c7de38-6755-49d8-91d8-b812630abd65',
]);

echo $token;