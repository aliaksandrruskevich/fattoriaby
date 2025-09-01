// JavaScript specific to о компании.html

// Данные для модального окна
const modalData = {
    premium: {
        title: "Недвижимость премиум",
        content: "<p>Наша премиальная недвижимость включает эксклюзивные квартиры и дома в лучших районах города с высококачественной отделкой и современными технологиями.</p><p>Мы предлагаем объекты бизнес и премиум-класса с уникальными планировками, панорамными видами и развитой инфраструктурой.</p>"
    },
    speed: {
        title: "Скорость работы",
        content: "<p>Благодаря отлаженным процессам и большой базе объектов мы находим подходящие варианты в 2 раза быстрее рынка.</p><p>Наша команда профессионалов оперативно реагирует на запросы клиентов и обеспечивает быстрый подбор и просмотр объектов.</p>"
    },
    experience: {
        title: "10 лет опыта",
        content: "<p>За 10 лет работы мы накопили уникальный опыт, который позволяет нам эффективно решать даже самые сложные задачи.</p><p>Наши специалисты постоянно совершенствуют свои знания и следят за изменениями на рынке недвижимости.</p>"
    },
    legal: {
        title: "Юридическое сопровождение",
        content: "<p>Наши юристы обеспечивают полное юридическое сопровождение сделки, проверяют документы и гарантируют безопасность.</p><p>Мы берем на себя все правовые аспекты сделки, чтобы вы могли быть уверены в ее чистоте и законности.</p>"
    },
    clients: {
        title: "Довольные клиенты",
        content: "<p>Более 500 довольных клиентов рекомендуют нас своим друзьям и знакомым.</p><p>Мы гордимся своей репутацией и положительными отзывами, которые получаем от наших клиентов.</p>"
    }
};

// Обработка формы качества
function handleQualityForm() {
    const form = document.getElementById('qualityForm');
    if (!form) return;
    
    form.addEventListener("submit", function(e){
        e.preventDefault();
        
        // Проверка заполнения полей
        if (!form.name.value.trim() || !form.phone.value.trim()) {
            showToast('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
        submitBtn.disabled = true;
        
        // Создаем FormData
        const formData = new FormData();
        formData.append('name', form.name.value);
        formData.append('phone', form.phone.value);
        formData.append('type', 'Консультация по стоимости');
        formData.append('dateTime', new Date().toLocaleString());
        
        fetch(scriptURL, { 
            method: "POST", 
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log('Успех:', data);
            showToast('Спасибо! Мы свяжемся с вами в ближайшее время.');
            form.reset();
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка при отправке. Попробуйте снова.', 'error');
        })
        .finally(() => {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Обработка формы отзыва
function handleFeedbackModalForm() {
    const form = document.getElementById('feedbackFormModal');
    if (!form) return;
    
    form.addEventListener("submit", function(e){
        e.preventDefault();
        
        // Проверка заполнения полей
        if (!form.name.value.trim() || !form.phone.value.trim() || !form.message.value.trim()) {
            showToast('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
        submitBtn.disabled = true;
        
        // Создаем FormData
        const formData = new FormData();
        formData.append('name', form.name.value);
        formData.append('phone', form.phone.value);
        formData.append('message', form.message.value);
        formData.append('type', 'Отзыв о работе');
        formData.append('dateTime', new Date().toLocaleString());
        
        fetch(scriptURL, { 
            method: "POST", 
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            return response.text();
        })
        .then(data => {
            console.log('Успех:', data);
            showToast('Спасибо за ваш отзыв!');
            form.reset();
            
            // Закрываем модальное окно
            const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            setTimeout(() => modal.hide(), 2000);
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast('Ошибка при отправке. Попробуйте снова.', 'error');
        })
        .finally(() => {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Обработка аккордеона с фактами
function initFactsAccordion() {
    const factHeaders = document.querySelectorAll('.fact-header');
    
    factHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const button = this.querySelector('.toggle');
            
            // Переключаем видимость контента
            if (content.style.display === 'block') {
                content.style.display = 'none';
                button.textContent = '+';
                button.classList.remove('active');
            } else {
                content.style.display = 'block';
                button.textContent = '−';
                button.classList.add('active');
            }
        });
    });
}

// Инициализация всех обработчиков для about.html
document.addEventListener('DOMContentLoaded', function() {
    // Обработка форм
    handleForm("feedbackFormTop", "Обратная связь (верхняя)");
    handleForm("feedbackFormBottom", "Обратная связь (нижняя)");
    handleCallbackForm();
    handleQualityForm();
    handleFeedbackModalForm();
    
    // Инициализация аккордеона с фактами
    initFactsAccordion();
    
    // Обработка кликов по квадратам категорий
    const categorySquares = document.querySelectorAll('.category-square');
    categorySquares.forEach(square => {
        square.addEventListener('click', function() {
            const category = this.querySelector('h4').textContent;
            showToast(`Вы выбрали категорию: ${category}. Скоро с вами свяжется наш специалист!`);
            
            // Можно также автоматически открыть форму обратной связи
            setTimeout(() => {
                const modal = new bootstrap.Modal(document.getElementById('callbackModal'));
                modal.show();
            }, 1500);
        });
    });
    
    // Обработка кликов по элементам сетки преимуществ
    const gridItems = document.querySelectorAll('.item.text');
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
    
    gridItems.forEach(item => {
        item.addEventListener('click', function() {
            const infoType = this.getAttribute('data-info-type');
            
            // Заполняем модальное окно информацией в зависимости от типа
            if (modalData[infoType]) {
                document.getElementById('infoModalTitle').textContent = modalData[infoType].title;
                document.getElementById('infoModalBody').innerHTML = modalData[infoType].content;
            } else {
                document.getElementById('infoModalTitle').textContent = "Дополнительная информация";
                document.getElementById('infoModalBody').innerHTML = "<p>Подробная информация об этом преимуществе.</p>";
            }
            
            infoModal.show();
        });
    });
    
    // Правильное закрытие модального окна
    document.getElementById('infoModal').addEventListener('hidden.bs.modal', function () {
        document.getElementById('infoModalBody').innerHTML = '';
    });
});
