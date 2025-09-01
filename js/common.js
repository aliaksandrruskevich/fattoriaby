// Общие функции для сайта (без обработки форм - это в forms.js)

// Инициализация анимаций AOS
function initAOS() {
    AOS.init({ duration: 1000, once: true });
}

// Функция для загрузки и вставки HTML компонентов
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки ${filePath}: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Формы обрабатываются в forms.js
        
        // Инициализация AOS анимаций
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: true });
        }
        
    } catch (error) {
        console.error('Ошибка загрузки компонента:', error);
    }
}

// Инициализация всех обработчиков после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initAOS();

    // Формы обрабатываются в forms.js

    // Автоматическая загрузка компонентов, если контейнеры существуют
    if (document.getElementById('header-container')) {
        loadComponent('header-container', 'includes/header.html');
    }
    if (document.getElementById('footer-container')) {
        loadComponent('footer-container', 'includes/footer.html');
    }
});
