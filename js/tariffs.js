function calculateCost() {
    const price = parseFloat(document.getElementById('propertyPrice').value);
    const serviceType = document.getElementById('serviceType').value;
    const resultDiv = document.getElementById('calculationResult');
    const resultAmount = document.getElementById('resultAmount');
    const resultDetails = document.getElementById('resultDetails');

    if (isNaN(price) || price <= 0) {
        alert('Пожалуйста, введите корректную стоимость объекта.');
        return;
    }

    let cost = 0;
    let details = '';

    if (serviceType === 'sale') {
        // Расчет по процентам от стоимости для продажи
        let percentage = 0;
        if (price <= 176400) {
            percentage = 3.0;
        } else if (price <= 210000) {
            percentage = 2.5;
        } else if (price <= 243600) {
            percentage = 2.4;
        } else if (price <= 277200) {
            percentage = 2.3;
        } else if (price <= 315000) {
            percentage = 2.2;
        } else if (price <= 348600) {
            percentage = 2.1;
        } else if (price <= 382200) {
            percentage = 2.0;
        } else if (price <= 420000) {
            percentage = 1.9;
        } else if (price <= 441000) {
            percentage = 1.8;
        } else if (price <= 487200) {
            percentage = 1.7;
        } else if (price <= 520800) {
            percentage = 1.6;
        } else if (price <= 554400) {
            percentage = 1.5;
        } else if (price <= 588000) {
            percentage = 1.4;
        } else if (price <= 625800) {
            percentage = 1.3;
        } else if (price <= 659400) {
            percentage = 1.2;
        } else if (price <= 693000) {
            percentage = 1.1;
        } else {
            percentage = 1.0;
        }
        cost = price * percentage / 100;
        details = `Тариф: ${percentage}% от стоимости ${price.toLocaleString()} BYN`;
    } else if (serviceType === 'purchase') {
        // Для подбора варианта - фиксированная сумма из таблицы для квартиры
        cost = 1890; // Услуги по подбору вариантов (квартира, комната, доля)
        details = `Стоимость услуг по подбору варианта: 1890 BYN`;
    } else if (serviceType === 'consultation') {
        // Консультация - фиксированная сумма
        cost = 126; // Из таблицы для консультаций
        details = `Стоимость консультационных услуг: 126 BYN`;
    } else if (serviceType === 'info') {
        // Представление информации - фиксированная сумма
        cost = 210; // Услуги по представлению информации о спросе и предложении
        details = `Стоимость услуг по представлению информации: 210 BYN`;
    } else if (serviceType === 'agreement') {
        // Согласование условий - фиксированная сумма
        cost = 420; // Организация и проведение согласования условий
        details = `Стоимость услуг по согласованию условий: 420 BYN`;
    } else if (serviceType === 'document_prep') {
        // Подготовка документов - фиксированная сумма
        cost = 1260; // Помощь в подготовке документов для сделки
        details = `Стоимость услуг по подготовке документов: 1260 BYN`;
    } else if (serviceType === 'registration') {
        // Регистрация - фиксированная сумма
        cost = 630; // Помощь в подготовке документов для регистрации
        details = `Стоимость услуг по регистрации: 630 BYN`;
    }

    resultAmount.textContent = cost.toLocaleString() + ' BYN';
    resultDetails.textContent = details;
    resultDiv.style.display = 'block';
}
