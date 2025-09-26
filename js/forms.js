if (typeof window.scriptURL === 'undefined') {
  window.scriptURL = "https://script.google.com/macros/s/AKfycbx2cgkl7fZ3SU1vY7rB6m_NpH9BZultSe0e65_7rkLJN_hSPeYRqXau3HNL8nFRZ-wFIw/exec";
}

const scriptURL = window.scriptURL;

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  // Clean input: remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  // International phone number regex (E.164 format)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(cleanPhone);
}

function showFieldError(field, message) {
  clearFieldError(field);
  field.classList.add('is-invalid');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const errorDiv = field.parentNode.querySelector('.invalid-feedback');
  if (errorDiv) {
    errorDiv.remove();
  }
}

function validateForm(form) {
  let isValid = true;

  const nameField = form.querySelector('input[placeholder*="имя"]') || form.name;
  if (nameField && nameField.value.trim().length < 2) {
    showFieldError(nameField, 'Имя должно содержать минимум 2 символа');
    isValid = false;
  }

  const phoneField = form.querySelector('input[type="tel"]') || form.phone;
  if (phoneField && !validatePhone(phoneField.value)) {
    showFieldError(phoneField, 'Введите корректный номер телефона');
    isValid = false;
  }

  const emailField = form.querySelector('input[type="email"]') || form.email;
  if (emailField && emailField.value && !validateEmail(emailField.value)) {
    showFieldError(emailField, 'Введите корректный email адрес');
    isValid = false;
  }

  if (form.request && form.request.value.trim().length < 5) {
    showFieldError(form.request, 'Описание должно содержать минимум 5 символов');
    isValid = false;
  }

  const agreeCheckbox = form.querySelector('#agree') || form.querySelector('#agreeBottom') || form.querySelector('input[type="checkbox"][required]');
  if (agreeCheckbox && !agreeCheckbox.checked) {
    showFieldError(agreeCheckbox, 'Необходимо согласиться с обработкой персональных данных');
    isValid = false;
  }

  return isValid;
}

function showToast(message, type = 'info') {
  const existingToasts = document.querySelectorAll('.toast-notification');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.textContent = message;

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
}

function handleFormSubmission(e) {
  e.preventDefault();

  const form = e.target;

  form.querySelectorAll('.is-invalid').forEach(field => clearFieldError(field));

  if (!validateForm(form)) {
    showToast('Пожалуйста, исправьте ошибки в форме', 'error');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Отправка...';
  submitBtn.disabled = true;

  const nameField = form.querySelector('input[placeholder*="имя"]') || form.name;
  const phoneField = form.querySelector('input[type="tel"]') || form.phone;
  const emailField = form.querySelector('input[type="email"]') || form.email;

  const formData = new FormData();
  formData.append('name', nameField ? nameField.value.trim() : '');
  formData.append('phone', phoneField ? phoneField.value.trim() : '');

  if (emailField && emailField.value) formData.append('email', emailField.value.trim());
  if (form.request && form.request.value) formData.append('request', form.request.value.trim());
  if (form.comments && form.comments.value) formData.append('request', form.comments.value.trim());
  if (form.address && form.address.value) formData.append('address', form.address.value.trim());
  if (form.loanAmount && form.loanAmount.value) formData.append('loanAmount', form.loanAmount.value);
  if (form.type && form.type.value) formData.append('propertyType', form.type.value);
  if (form.area && form.area.value) formData.append('area', form.area.value);
  if (form.budget && form.budget.value) formData.append('budget', form.budget.value);
  if (form.propertyType && form.propertyType.value) formData.append('propertyType', form.propertyType.value);
  if (form.distance && form.distance.value) formData.append('distance', form.distance.value);

  let formType = 'Обратная связь';
  if (form.id === 'testDriveForm') formType = 'Тест-драйв услуг';
  else if (form.id === 'trustCallbackForm') formType = 'Обратный звонок (Почему доверяют)';
  else if (form.id === 'contactForm') formType = 'Заявка на коммерческую недвижимость';
  else if (form.id === 'countrysideForm') formType = 'Заявка на загородную недвижимость';
  else if (form.classList.contains('contact-form')) formType = 'Консультация по новостройке';

  formData.append('type', formType);
  formData.append('dateTime', new Date().toLocaleString());
  formData.append('userAgent', navigator.userAgent);
  formData.append('pageUrl', window.location.href);

  fetch(scriptURL, {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.text();
  })
  .then(data => {
    showToast('Спасибо! Ваша заявка отправлена.', 'success');
    const form = submitBtn.closest('form');
    if (form) form.reset();
    form.querySelectorAll('.is-invalid').forEach(field => clearFieldError(field));
  })
  .catch(error => {
    let errorMessage = 'Ошибка при отправке. Попробуйте позже.';
    if (error.message.includes('400')) errorMessage = 'Ошибка в данных формы. Проверьте введенные данные.';
    else if (error.message.includes('403')) errorMessage = 'Доступ запрещен. Обратитесь в поддержку.';
    else if (error.message.includes('500')) errorMessage = 'Серверная ошибка. Попробуйте позже.';
    else if (error.message.includes('network') || error.message.includes('fetch')) errorMessage = 'Проблемы с подключением. Проверьте интернет и попробуйте снова.';
    showToast(errorMessage, 'error');
  })
  .finally(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

document.addEventListener('DOMContentLoaded', function() {
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
    const form = document.getElementById(formId);
    if (form) {
      form.addEventListener('submit', handleFormSubmission);
    }
  });

  // Add event listeners to all forms with class 'contact-form'
  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach(form => {
    form.addEventListener('submit', handleFormSubmission);
  });
});
