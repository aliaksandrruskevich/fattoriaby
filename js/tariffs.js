// Инициализация анимаций
AOS.init({ duration: 1000, once: true });

// Функция для расчета стоимости услуг
function calculateCost() {
    const price = parseFloat(document.getElementById('propertyPrice').value);
    const serviceType = document.getElementById('serviceType').value;
    
    if (!price || price <= 0) {
        showToast('Пожалуйста, введите корректную стоимость объекта', 'error');
        return;
    }
    
    let tariffRate = 0;
    let serviceName = '';
    
    // Определяем тариф в зависимости от стоимости
    if (price <= 20000) {
        tariffRate = 3.0;
    } else if (price <= 25000) {
        tariffRate = 2.6;
    } else if (price <= 30000) {
        tariffRate = 2.4;
    } else if (price <= 35000) {
        tariffRate = 2.3;
    } else if (price <= 40000) {
        tariffRate = 2.2;
    } else if (price <= 45000) {
        tariffRate = 2.1;
    } else if (price <= 50000) {
        tariffRate = 2.0;
    } else if (price <= 55000) {
        tariffRate = 1.9;
    } else if (price <= 60000) {
        tariffRate = 1.8;
    } else if (price <= 65000) {
        tariffRate = 1.7;
    } else if (price <= 70000) {
        tariffRate = 1.6;
    } else if (price <= 75000) {
        tariffRate = 1.5;
    } else if (price <= 80000) {
        tariffRate = 1.4;
    } else if (price <= 85000) {
        tariffRate = 1.3;
    } else if (price <= 90000) {
        tariffRate = 1.2;
    } else if (price <= 95000) {
        tariffRate = 1.1;
    } else {
        tariffRate = 1.0;
    }
    
    // Определяем название услуги
    switch(serviceType) {
        case 'sale':
            serviceName = 'продажи недвижимости';
            break;
        case 'purchase':
            serviceName = 'покупки недвижимости';
            break;
        case 'rent':
            serviceName = 'аренды';
            tariffRate = 50; // Фиксированная ставка для аренды в базовых величинах
            break;
        case 'consultation':
            serviceName = 'консультации';
            tariffRate = 3; // Фиксированная ставка для консультации в базовых величинах
            break;
    }
    
    let resultAmount = 0;
    let resultDetails = '';
    
    if (serviceType === 'rent' || serviceType === 'consultation') {
        // Для аренды и консультации - фиксированная ставка в базовых величинах
        resultAmount = tariffRate;
        resultDetails = `Стоимость услуги ${serviceName}: ${tariffRate} базовых величин`;
    } else {
        // Для продажи/покупки - процент от стоимости
        resultAmount = (price * tariffRate / 100).toFixed(2);
        resultDetails = `Тариф: ${tariffRate}% от стоимости объекта (${price} BYN)`;
    }
    
    // Показываем результат
    const resultElement = document.getElementById('resultAmount');
    const detailsElement = document.getElementById('resultDetails');
    const resultContainer = document.getElementById('calculationResult');
    
    resultElement.innerHTML = `<span class="h2 text-primary">${resultAmount} ${serviceType === 'rent' || serviceType === 'consultation' ? 'базовых величин' : 'BYN'}</span>`;
    detailsElement.textContent = resultDetails;
    resultContainer.style.display = 'block';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчик для формы калькулятора
    const calculatorForm = document.getElementById('calculatorForm');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateCost();
        });
    }
});
