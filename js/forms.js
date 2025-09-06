// URL Google Apps Script для обработки форм
const scriptURL = "https://script.google.com/macros/s/AKfycbx2cgkl7fZ3SU1vY7rB6m_NpH9BZultSe0e65_7rkLJN_hSPeYRqXau3HNL8nFRZ-wFIw/exec";

// Функция валидации email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Функция валидации телефона
function validatePhone(phone) {
    const phoneRegex = /^(\+375|375|80)?[0-9]{9}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

// Функция для показа ошибок поля
function showFieldError(field, message) {
    // Убираем предыдущие ошибки
    clearFieldError(field);

    // Добавляем класс ошибки
    field.classList.add('is-invalid');

    // Создаем элемент ошибки
    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;

    // Вставляем после поля
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

// Функция для очистки ошибок поля
function clearFieldError(field) {
    field.classList.remove('is-invalid');
    const errorDiv = field.parentNode.querySelector('.invalid-feedback');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Функция для валидации формы
function validateForm(form) {
    let isValid = true;
    const errors = [];

    // Валидация имени
    if (form.name && form.name.value.trim().length < 2) {
        showFieldError(form.name, 'Имя должно содержать минимум 2 символа');
        isValid = false;
        errors.push('Имя слишком короткое');
    }

    // Валидация телефона
    if (form.phone && !validatePhone(form.phone.value)) {
        showFieldError(form.phone, 'Введите корректный номер телефона');
        isValid = false;
        errors.push('Некорректный телефон');
    }

    // Валидация email если есть
    if (form.email && form.email.value && !validateEmail(form.email.value)) {
        showFieldError(form.email, 'Введите корректный email адрес');
        isValid = false;
        errors.push('Некорректный email');
    }

    // Валидация поля request если есть
    if (form.request && form.request.value.trim().length < 5) {
        showFieldError(form.request, 'Описание должно содержать минимум 5 символов');
        isValid = false;
        errors.push('Слишком короткое описание');
    }

    // Валидация чекбокса согласия
    const agreeCheckbox = form.querySelector('#agree') || form.querySelector('#agreeBottom') || form.querySelector('input[type="checkbox"][required]');
    if (agreeCheckbox && !agreeCheckbox.checked) {
        showFieldError(agreeCheckbox, 'Необходимо согласиться с обработкой персональных данных');
        isValid = false;
        errors.push('Не согласен с обработкой данных');
    }

    return { isValid, errors };
}

// Функция для повторной отправки с задержкой
function retrySubmit(formData, submitBtn, originalText, retryCount = 0) {
    const maxRetries = 3;
    const delay = Math.pow(2, retryCount) * 1000; // Экспоненциальная задержка

    setTimeout(() => {
        console.log('Отправка запроса на Google Apps Script, попытка:', retryCount + 1);
        fetch(scriptURL, {
            method: "POST",
            body: formData
        })
        .then(response => {
            console.log('Ответ от сервера:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            console.log('Успешный ответ:', data);
            showToast('Спасибо! Ваша заявка отправлена.', 'success');
            // Находим и сбрасываем форму
            const form = submitBtn.closest('form');
            if (form) form.reset();
            // Очищаем все ошибки валидации
            form.querySelectorAll('.is-invalid').forEach(field => clearFieldError(field));
        })
        .catch(error => {
            console.error('Ошибка при отправке:', error);

            if (retryCount < maxRetries && (error.message.includes('network') || error.message.includes('fetch'))) {
                showToast(`Повторная попытка ${retryCount + 1}/${maxRetries}...`, 'warning');
                retrySubmit(formData, submitBtn, originalText, retryCount + 1);
            } else {
                let errorMessage = 'Ошибка при отправке. Попробуйте позже.';

                if (error.message.includes('400')) {
                    errorMessage = 'Ошибка в данных формы. Проверьте введенные данные.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Доступ запрещен. Обратитесь в поддержку.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Серверная ошибка. Попробуйте позже.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = 'Проблемы с подключением. Проверьте интернет и попробуйте снова.';
                }

                showToast(errorMessage, 'error');
            }
        })
        .finally(() => {
            // Восстанавливаем кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }, delay);
}

function handleForm(formId) {
    console.log(`Initializing form handler for: ${formId}`);
    const form = document.getElementById(formId);
    if (!form) {
        console.warn(`Form with id ${formId} not found`);
        return;
    }

    // Очищаем ошибки при вводе
    form.addEventListener('input', function(e) {
        if (e.target.classList.contains('is-invalid')) {
            clearFieldError(e.target);
        }
    });

    form.addEventListener("submit", function(e){
        e.preventDefault();
        console.log(`Form ${formId} submitted`);

        // Очищаем предыдущие ошибки
        form.querySelectorAll('.is-invalid').forEach(field => clearFieldError(field));

        // Валидируем форму
        const validation = validateForm(form);
        if (!validation.isValid) {
            showToast('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
        submitBtn.disabled = true;

        // Создаем FormData для отправки
        const formData = new FormData();
        formData.append('name', form.name.value.trim());
        formData.append('phone', form.phone.value.trim());

        // Добавляем дополнительные поля если они есть
        if (form.email && form.email.value) {
            formData.append('email', form.email.value.trim());
        }
        if (form.request && form.request.value) {
            formData.append('request', form.request.value.trim());
        }
        // Для формы contactForm используем поле comments как request
        if (form.comments && form.comments.value) {
            formData.append('request', form.comments.value.trim());
        }
        if (form.address && form.address.value) {
            formData.append('address', form.address.value.trim());
        }
        if (form.loanAmount && form.loanAmount.value) {
            formData.append('loanAmount', form.loanAmount.value);
        }
        // Дополнительные поля для contactForm
        if (form.type && form.type.value) {
            formData.append('propertyType', form.type.value);
        }
        if (form.area && form.area.value) {
            formData.append('area', form.area.value);
        }
        if (form.budget && form.budget.value) {
            formData.append('budget', form.budget.value);
        }
        // Дополнительные поля для countrysideForm
        if (form.propertyType && form.propertyType.value) {
            formData.append('propertyType', form.propertyType.value);
        }
        if (form.distance && form.distance.value) {
            formData.append('distance', form.distance.value);
        }

        // Определяем тип формы
        let formType = 'Обратная связь';
        if (formId === 'testDriveForm') {
            formType = 'Тест-драйв услуг';
        } else if (formId === 'trustCallbackForm') {
            formType = 'Обратный звонок (Почему доверяют)';
        } else if (formId === 'contactForm') {
            formType = 'Заявка на коммерческую недвижимость';
        } else if (formId === 'countrysideForm') {
            formType = 'Заявка на загородную недвижимость';
        }

        formData.append('type', formType);
        formData.append('dateTime', new Date().toLocaleString());
        formData.append('userAgent', navigator.userAgent);
        formData.append('pageUrl', window.location.href);

        // Отправляем с возможностью повторных попыток
        retrySubmit(formData, submitBtn, originalText);
    });
}

// Инициализация всех форм при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем все формы обратной связи
    const feedbackForms = [
        'feedbackFormTop',
        'feedbackFormBottom',
        'testDriveForm',
        'trustCallbackForm',
        'countrysideForm',
        'calculatorForm',
        'mortgageForm',
        'qualityForm',
        'filterForm',
        'newsletterForm',
        'contactForm',
        'sellerForm',
        'buyerForm',
        'propertyInterestForm'
    ];
    feedbackForms.forEach(formId => {
        handleForm(formId);
    });
});
