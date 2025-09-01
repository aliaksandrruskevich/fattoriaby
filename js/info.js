// Инициализация анимаций
AOS.init({ duration: 1000, once: true });

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
                if (modal) modal.hide();
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    handleTestDriveForm();
});
