<?php

namespace App\Services;

class DistanceService
{
    /**
     * Calcula a distância entre dois pontos geográficos (em km ou milhas)
     *
     * @param float $lat1 Latitude do ponto 1
     * @param float $lon1 Longitude do ponto 1
     * @param float $lat2 Latitude do ponto 2
     * @param float $lon2 Longitude do ponto 2
     * @param string $unit 'km' ou 'mi'
     * @return float Distância arredondada
     */
    public function calculate(float $lat1, float $lon1, float $lat2, float $lon2, string $unit = 'km'): float
    {
        // Raio médio da Terra
        $R = $unit === 'mi' ? 3958.8 : 6371.0;

        // Converter graus para radianos
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        // Diferenças
        $dLat = $lat2 - $lat1;
        $dLon = $lon2 - $lon1;

        // Fórmula de Haversine
        $a = sin($dLat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dLon / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        // Distância final
        $distance = $R * $c;

        return round($distance, 2);
    }
}
