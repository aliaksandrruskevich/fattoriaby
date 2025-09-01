// URL вашего Google Apps Script
const scriptURL = "https://script.google.com/macros/s/AKfycbx2cgkl7fZ3SU1vY7rB6m_NpH9BZultSe0e65_7rkLJN_hSPeYRqXau3HNL8nFRZ-wFIw/exec";

// Функция для показа уведомлений
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, { delay: 5000 });
    bsToast.show();
    
    // Удаляем toast из DOM после скрытия
    toast.addEventListener('hidden.bs.toast', function () {
      toast.remove();
    });
}

// Общая функция обработки форм
function handleForm(formId, formType = 'Обратная связь') {
    const form = document.getElementById(formId);
    if (!form) return;
    
    form.addEventListener("submit", function(e){
      e.preventDefault();
      
      // Проверка заполнения полей
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('is-invalid');
        } else {
          field.classList.remove('is-invalid');
        }
      });
      
      if (!isValid) {
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
      
      // Добавляем все поля формы
      const formElements = form.elements;
      for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.type !== 'submit') {
          formData.append(element.name, element.value);
        }
      }
      
      // Добавляем тип формы и дату
      formData.append('type', formType);
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
        showToast('Спасибо! Ваша заявка отправлена.');
        form.reset();
        
        // Закрываем модальное окно, если форма в модалке
        const modalElement = form.closest('.modal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            setTimeout(() => modal.hide(), 2000);
          }
        }
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

// Обработка формы обратного звонка
function handleCallbackForm() {
    const form = document.getElementById('callbackForm');
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
      formData.append('type', 'Обратный звонок');
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
        showToast('Спасибо! Мы перезвоним вам в ближайшее время.');
        form.reset();
        
        // Закрываем модальное окно
        const modal = bootstrap.Modal.getInstance(document.getElementById('callbackModal'));
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

// Инициализация анимаций AOS
function initAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            duration: 1000, 
            once: true,
            offset: 100
        });
    }
}

// Обработка кликов по категориям недвижимости
function initCategoryClicks() {
    const categories = document.querySelectorAll('.category-square');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryTitle = this.querySelector('h4').textContent.trim();
            
            switch(categoryTitle) {
                case 'Новостройки':
                    window.location.href = 'новостройки.html';
                    break;
                case 'Коммерческая':
                    window.location.href = 'камерческая недвижимость.html';
                    break;
                case 'Наши объекты':
                    // Можно добавить переход на страницу с объектами
                    showToast('Функция в разработке');
                    break;
                case 'Загородная':
                    // Можно добавить переход на страницу с загородной недвижимостью
                    showToast('Функция в разработке');
                    break;
            }
        });
    });
}

// Инициализация всех обработчиков после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация AOS
    initAOS();
    
    // Инициализация кликов по категориям
    initCategoryClicks();
    
    // Инициализация всех форм обратной связи
    const feedbackForms = ['feedbackFormTop', 'feedbackFormBottom', 'testDriveForm', 'trustCallbackForm'];
    feedbackForms.forEach(formId => {
        handleForm(formId);
    });
    
    // Инициализация формы обратного звонка
    handleCallbackForm();
    
    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Инициализация всех модальных окон
    const modalElements = document.querySelectorAll('.modal');
    modalElements.forEach(modalElement => {
        new bootstrap.Modal(modalElement);
    });
    
    // Добавляем курсор-указатель для кликабельных элементов
    document.querySelectorAll('.category-square, .special-card, .team-card, .tariff-card').forEach(element => {
        element.style.cursor = 'pointer';
    });
});

// Функция для открытия модального окна
function openModal(modalId) {
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

// Функция для закрытия модального окна
function closeModal(modalId) {
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
        modal.hide();
    }
}

// Утилитарные функции
function formatPhone(phone) {
    return phone.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,11}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Глобальные обработчики ошибок
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Обработка offline/online статуса
window.addEventListener('online', function() {
    showToast('Соединение восстановлено', 'success');
});

window.addEventListener('offline', function() {
    showToast('Отсутствует интернет-соединение', 'error');
});

// Полифиллы для старых браузеров
if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

if (!HTMLCollection.prototype.forEach) {
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
}
