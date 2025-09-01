// Инициализация AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// Показ/скрытие кнопки "Наверх"
window.addEventListener('scroll', function() {
  const backToTop = document.querySelector('.back-to-top');
  if (window.pageYOffset > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

// Переключение между видами сетка/список
document.getElementById('gridView').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('listView').classList.remove('active');
  document.getElementById('propertiesContainer').className = 'properties-container';
  document.querySelector('.properties-grid').className = 'properties-grid';
});

document.getElementById('listView').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('gridView').classList.remove('active');
  document.getElementById('propertiesContainer').className = 'properties-container properties-list';
  document.querySelector('.properties-grid').className = 'properties-grid';
});

// Обновление диапазона цен
const priceRange = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');

priceRange.addEventListener('input', function() {
  minPrice.textContent = '0';
  maxPrice.textContent = formatPrice(this.value);
});

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

// Функционал для кнопок "Подробнее"
document.addEventListener('DOMContentLoaded', function() {
  const propertyCards = document.querySelectorAll('.property-card');
  const propertyModal = new bootstrap.Modal(document.getElementById('propertyModal'));
  const propertyModalTitle = document.getElementById('propertyModalTitle');
  const propertyModalContent = document.getElementById('propertyModalContent');

  propertyCards.forEach(card => {
    const detailsBtn = card.querySelector('.btn-outline-primary');
    detailsBtn.addEventListener('click', () => {
      // Извлекаем детали объекта из карточки
      const title = card.querySelector('.property-details h5').textContent;
      const location = card.querySelector('.property-details p.text-muted').textContent;
      const price = card.querySelector('.property-price').textContent;
      const features = card.querySelectorAll('.property-features li');
      const description = card.querySelector('.property-details p:not(.text-muted):not(.property-price)').textContent;
      const imgSrc = card.querySelector('img.property-img').src;
      const imgAlt = card.querySelector('img.property-img').alt;

      // Строим HTML контент для модального окна
      let featuresHtml = '<ul class="list-unstyled">';
      features.forEach(feature => {
        featuresHtml += `<li>${feature.innerHTML}</li>`;
      });
      featuresHtml += '</ul>';

      const modalHtml = `
        <img src="${imgSrc}" alt="${imgAlt}" class="img-fluid mb-3" />
        <h5>${title}</h5>
        <p class="text-muted">${location}</p>
        <div class="property-price mb-3">${price}</div>
        ${featuresHtml}
        <p>${description}</p>
      `;

      propertyModalTitle.textContent = title;
      propertyModalContent.innerHTML = modalHtml;

      propertyModal.show();
    });
  });

  // Обработка формы в модальном окне
  const interestForm = document.getElementById('propertyInterestForm');
  if (interestForm) {
    interestForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Здесь можно добавить логику отправки формы
      alert('Спасибо! Ваша заявка на подробную информацию отправлена.');
      interestForm.reset();
      propertyModal.hide();
    });
  }
});
