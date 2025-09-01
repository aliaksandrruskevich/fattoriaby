// URL вашего Google Apps Script
const scriptURL = "https://script.google.com/macros/s/AKfycbx2cgkl7fZ3SU1vY7rB6m_NpH9BZultSe0e65_7rkLJN_hSPeYRqXau3HNL8nFRZ-wFIw/exec";

// Функция для показа уведомлений
function showToast(message, type = 'success') {
    const toastContainer = document.querySelector('.toast-container');
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

// Данные для модального окна "Почему нам доверяют"
const trustData = {
    experience: {
        title: "Опыт работы",
        content: "<p>Наше агентство работает на рынке недвижимости более 10 лет. За это время мы накопили бесценный опыт, который позволяет нам эффективно решать даже самые сложные задачи наших клиентов.</p><p>Мы знаем все тонкости рынка недвижимости и готовы предложить вам наиболее выгодные решения.</p>"
    },
    reliability: {
        title: "Надежность",
        content: "<p>Мы гарантируем полную прозрачность всех сделок и юридическую чистоту документов. Наши юристы тщательно проверяют каждый объект недвижимости перед тем, как предложить его клиентам.</p><p>Более 1000 успешных сделок без единого судебного разбирательства - лучший показатель нашей надежности.</p>"
    },
    results: {
        title: "Результат",
        content: "<p>Мы нацелены на результат и делаем все возможное, чтобы наши клиенты оставались довольны. Наша команда профессионалов работает слаженно, чтобы обеспечить максимально выгодные условия для каждой сделки.</p><p>95% наших клиентов рекомендуют нас своим друзьям и знакомым - это лучшая оценка нашей работы.</p>"
    },
    logo1: {
        title: "Компания БИР",
        content: "<p>Белорусское общество защиты прав потребителей - одна из организаций, которая доверяет нашему агентству и рекомендует нас своим клиентам.</p>"
    }
};

// Обработка формы тест-драйва
function handleTestDriveForm() {
    const form = document.getElementById('testDriveForm');
    if (!form) return;
    
    form.addEventListener("submit", function(e){
        e.preventDefault();
        
        // Проверка заполнения полей
        if (!form.name.value.trim() || !form.phone.value.trim() || !form.agreeCheck.checked) {
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
        formData.append('address', form.address.value);
        formData.append('type', 'Тест-драйв услуг');
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
            showToast('Спасибо! Ваша заявка отправлена. Наш агент свяжется с вами в течение 15 минут.');
            form.reset();
            // Закрываем модальное окно через 2 секунды
            setTimeout(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('testDriveModal'));
                modal.hide();
            }, 2000);
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

// Обработка формы обратного звонка в модальном окне "Почему нам доверяют"
function handleTrustCallbackForm() {
    const form = document.getElementById('trustCallbackForm');
    if (!form) return;
    
    form.addEventListener("submit", function(e){
        e.preventDefault();
        
        // Проверка заполнения полей
        if (!form.phone.value.trim()) {
            showToast('Пожалуйста, укажите номер телефона', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
        submitBtn.disabled = true;
        
        // Создаем FormData
        const formData = new FormData();
        formData.append('name', form.name.value || 'Не указано');
        formData.append('phone', form.phone.value);
        formData.append('type', 'Обратный звонок (Почему доверяют)');
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

// Обработка открытия модального окна "Почему нам доверяют"
function initTrustModal() {
    const trustModal = document.getElementById('trustModal');
    if (trustModal) {
        trustModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const trustType = button.getAttribute('data-trust-type');
            const modalTitle = trustModal.querySelector('.modal-title');
            const modalContent = trustModal.querySelector('#trustModalContent');
            
            if (trustData[trustType]) {
                modalTitle.textContent = trustData[trustType].title;
                modalContent.innerHTML = trustData[trustType].content;
            } else {
                modalTitle.textContent = "Почему нам доверяют";
                modalContent.innerHTML = "<p>Мы ценим доверие наших клиентов и делаем все возможное, чтобы оправдать его. Наша профессиональная команда готова помочь вам с любыми вопросами, связанными с недвижимостью.</p>";
            }
        });
    }
}

// Инициализация анимаций AOS
function initAOS() {
    AOS.init({ duration: 1000, once: true });
}

// Инициализация всех обработчиков после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    initAOS();
    
    // Обработка форм
    handleForm("feedbackFormTop", "Обратная связь (верхняя)");
    handleForm("feedbackFormBottom", "Обратная связь (нижняя)");
    handleTestDriveForm();
    handleTrustCallbackForm();
    handleCallbackForm();
    
    // Инициализация модального окна
    initTrustModal();
});
