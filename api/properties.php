<?php
// Файл api/properties.php
// Этот скрипт будет выступать прокси для интеграции с внешним API и обработки данных

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// URL внешнего API
$apiUrl = 'https://realt.by/bff/proxy/export/api/export/token/e68b296c864d8a9';

// Функция для получения данных с внешнего API
function fetchData($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        if ($response === false || $httpCode !== 200) {
            return false;
        }
        return $response;
    } else {
        $response = @file_get_contents($url);
        if ($response === false) {
            return false;
        }
        return $response;
    }
}

$response = fetchData($apiUrl);

if ($response === false) {
    // Логируем ошибку (можно расширить для записи в файл)
    error_log('Ошибка получения данных с внешнего API: ' . $apiUrl);
    // Возвращаем мок-данные
    $mockData = [
        [
            "title" => "Квартира в центре Минска",
            "location" => "Минск, Центр",
            "price" => 120000,
            "type" => "Квартира",
            "description" => "Уютная квартира с современным ремонтом.",
            "features" => ["3 комнаты", "Балкон", "Ремонт"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+1"]
        ],
        [
            "title" => "Дом в пригороде",
            "location" => "Минский район",
            "price" => 250000,
            "type" => "Дом",
            "description" => "Просторный дом с большим участком.",
            "features" => ["5 комнат", "Гараж", "Сад"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+2"]
        ]
    ];
    echo json_encode($mockData);
    exit;
}

// Парсим XML
libxml_use_internal_errors(true);
$xml = simplexml_load_string($response, "SimpleXMLElement", LIBXML_NOCDATA);
if ($xml === false) {
    $errors = libxml_get_errors();
    $errorMessages = array_map(function($e) { return $e->message; }, $errors);
    error_log('Ошибка парсинга XML: ' . implode("; ", $errorMessages));
    // Возвращаем мок-данные
    $mockData = [
        [
            "title" => "Квартира в центре Минска",
            "location" => "Минск, Центр",
            "price" => 120000,
            "type" => "Квартира",
            "description" => "Уютная квартира с современным ремонтом.",
            "features" => ["3 комнаты", "Балкон", "Ремонт"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+1"]
        ],
        [
            "title" => "Дом в пригороде",
            "location" => "Минский район",
            "price" => 250000,
            "type" => "Дом",
            "description" => "Просторный дом с большим участком.",
            "features" => ["5 комнат", "Гараж", "Сад"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+2"]
        ]
    ];
    echo json_encode($mockData);
    exit;
}

// Преобразуем XML в массив
$json = json_encode($xml);
$data = json_decode($json, true);

// Проверяем наличие записей
if (!isset($data['record']) || !is_array($data['record'])) {
    error_log('Нет данных в ответе API');
    // Возвращаем мок-данные
    $mockData = [
        [
            "title" => "Квартира в центре Минска",
            "location" => "Минск, Центр",
            "price" => 120000,
            "type" => "Квартира",
            "description" => "Уютная квартира с современным ремонтом.",
            "features" => ["3 комнаты", "Балкон", "Ремонт"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+1"]
        ],
        [
            "title" => "Дом в пригороде",
            "location" => "Минский район",
            "price" => 250000,
            "type" => "Дом",
            "description" => "Просторный дом с большим участком.",
            "features" => ["5 комнат", "Гараж", "Сад"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+2"]
        ]
    ];
    echo json_encode($mockData);
    exit;
}

// Фильтрация объектов с ценой больше 0 (если поле price есть)
$filteredData = array_filter($data['record'], function($item) {
    return isset($item['price']) && floatval($item['price']) > 0;
});

// Возвращаем обработанные данные клиенту
if (empty($filteredData)) {
    // Возвращаем мок-данные
    $mockData = [
        [
            "title" => "Квартира в центре Минска",
            "location" => "Минск, Центр",
            "price" => 120000,
            "type" => "Квартира",
            "description" => "Уютная квартира с современным ремонтом.",
            "features" => ["3 комнаты", "Балкон", "Ремонт"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+1"]
        ],
        [
            "title" => "Дом в пригороде",
            "location" => "Минский район",
            "price" => 250000,
            "type" => "Дом",
            "description" => "Просторный дом с большим участком.",
            "features" => ["5 комнат", "Гараж", "Сад"],
            "photos" => ["https://via.placeholder.com/400x300?text=Property+2"]
        ]
    ];
    echo json_encode($mockData);
} else {
    echo json_encode(array_values($filteredData));
}
?>
