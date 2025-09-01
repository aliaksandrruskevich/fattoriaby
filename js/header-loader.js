/**
 * Функция для динамической загрузки общего header
 * Загружает содержимое из includes/header.html и вставляет в начало body
 */
function loadHeader() {
    // Создаем XMLHttpRequest для загрузки header
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Вставляем загруженный header в начало body
                document.body.insertAdjacentHTML('afterbegin', xhr.responseText);

                // Инициализируем AOS после загрузки header (если он используется)
                if (typeof AOS !== 'undefined') {
                    AOS.init({ duration: 1000, once: true });
                }

                console.log('Header успешно загружен');
            } else {
                console.error('Ошибка загрузки header:', xhr.status, xhr.statusText);
            }
        }
    };

    // Загружаем header из файла
    xhr.open('GET', 'includes/header.html', true);
    xhr.send();
}

/**
 * Альтернативная функция загрузки с использованием fetch API
 */
function loadHeaderFetch() {
    fetch('includes/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки header: ' + response.status);
            }
            return response.text();
        })
        .then(html => {
            // Вставляем загруженный header в начало body
            document.body.insertAdjacentHTML('afterbegin', html);

            // Инициализируем AOS после загрузки header
            if (typeof AOS !== 'undefined') {
                AOS.init({ duration: 1000, once: true });
            }

            console.log('Header успешно загружен через fetch');
        })
        .catch(error => {
            console.error('Ошибка загрузки header:', error);
        });
}

// Автоматическая загрузка header при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Используем XMLHttpRequest для лучшей совместимости
    loadHeader();
});
