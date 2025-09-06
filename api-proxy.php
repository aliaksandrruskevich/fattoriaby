<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$token = 'e68b296c864d8a9';
$api_url = "https://realt.by/bff/proxy/export/api/export/token/{$token}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Accept-Charset: utf-8'
]);

$response = curl_exec($ch);

// Если API не работает, используем тестовые данные
if ($response === false || curl_getinfo($ch, CURLINFO_HTTP_CODE) !== 200) {
    $test_data = [
        [
            "title" => "Квартира в центре Минска",
            "price" => "125 000 €",
            "description" => "Уютная квартира с современным ремонтом. Отличное расположение.",
            "address" => "ул. Ленина, 25"
        ],
        [
            "title" => "Дом в пригороде", 
            "price" => "275 000 €",
            "description" => "Просторный дом с большим участком. Идеально для семьи.",
            "address" => "Минский район, д. Заречье"
        ]
    ];
    echo json_encode($test_data, JSON_UNESCAPED_UNICODE);
} else {
    echo $response;
}

curl_close($ch);
?>