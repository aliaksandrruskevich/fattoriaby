// Функция для загрузки и вставки HTML компонентов
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки ${filePath}: ${response.status}`);
        }
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Инициализация обработчиков форм после загрузки
        if (typeof handleForm === 'function') {
            // Обработка форм обратной связи
            const feedbackForms = ['feedbackFormTop', 'feedbackFormBottom', 'testDriveForm', 'trustCallbackForm'];
            feedbackForms.forEach(formId => {
                handleForm(formId);
            });
        }
        
        // Инициализация AOS анимаций
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 1000, once: true });
        }
        
    } catch (error) {
        console.error('Ошибка загрузки компонента:', error);
    }
}

// Загрузка всех компонентов при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    // Создаем контейнеры для компонентов
    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';
    document.body.insertBefore(headerContainer, document.body.firstChild);
    
    const footerContainer = document.createElement('div');
    footerContainer.id = 'footer-container';
    document.body.appendChild(footerContainer);
    
    // Загружаем компоненты
    loadComponent('header-container', 'includes/header.html');
    loadComponent('footer-container', 'includes/footer.html');
    
    // Инициализация общих функций
    if (typeof initAOS === 'function') {
        initAOS();
    }
});
