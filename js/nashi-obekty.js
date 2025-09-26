AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  const propertiesContainer = document.getElementById('propertiesContainer');
  
  // Проверяем, что элемент существует
  if (!propertiesContainer) {
    console.error('Элемент propertiesContainer не найден');
    return;
  }

  let propertyModal = null;
  let propertyModalTitle = null;
  let propertyModalContent = null;

  // Инициализируем модальное окно только если оно существует
  const propertyModalElement = document.getElementById('propertyModal');
  if (propertyModalElement) {
    propertyModal = new bootstrap.Modal(propertyModalElement);
    propertyModalTitle = document.getElementById('propertyModalTitle');
    propertyModalContent = document.getElementById('propertyModalContent');
  }

  function formatPrice(price) {
    if (!price) return 'Цена не указана';
    return new Intl.NumberFormat('ru-RU').format(price) + ' $';
  }

  function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card';
    card.setAttribute('data-aos', 'fade-up');

    const imgSrc = property.photos && property.photos.length > 0 ? property.photos[0] : 'img/placeholder.jpg';
    const imgAlt = property.title || 'Объект недвижимости';

    // Features list HTML
    let featuresHtml = '';
    if (property.features && property.features.length > 0) {
      featuresHtml = '<ul class="property-features">';
      property.features.forEach(feature => {
        featuresHtml += `<li>${feature}</li>`;
      });
      featuresHtml += '</ul>';
    }

    card.innerHTML = `
      <div class="position-relative">
        <img src="${imgSrc}" class="property-img w-100" alt="${imgAlt}" onerror="this.src='img/placeholder.jpg'">
        <span class="property-badge badge-primary">${property.type || 'Недвижимость'}</span>
      </div>
      <div class="property-details">
        <h5>${property.title || 'Без названия'}</h5>
        <p class="text-muted">${property.location || 'Адрес не указан'}</p>
        <div class="property-price">${formatPrice(property.price)}</div>
        ${featuresHtml}
        <p>${property.description || ''}</p>
        <div class="d-grid gap-2">
          <button class="btn btn-outline-primary details-btn">Подробнее</button>
          <button class="btn btn-primary-custom view-btn">Запрос на просмотр</button>
        </div>
      </div>
    `;

    // Add event listener for "Подробнее" button
    const detailsBtn = card.querySelector('.details-btn');
    if (detailsBtn && propertyModal) {
      detailsBtn.addEventListener('click', () => {
        let featuresListHtml = '';
        if (property.features && property.features.length > 0) {
          featuresListHtml = '<ul class="list-unstyled">';
          property.features.forEach(f => {
            featuresListHtml += `<li>${f}</li>`;
          });
          featuresListHtml += '</ul>';
        }

        const modalHtml = `
          <img src="${imgSrc}" alt="${imgAlt}" class="img-fluid mb-3" onerror="this.src='img/placeholder.jpg'"/>
          <h5>${property.title || 'Без названия'}</h5>
          <p class="text-muted">${property.location || 'Адрес не указан'}</p>
          <div class="property-price mb-3">${formatPrice(property.price)}</div>
          ${featuresListHtml}
          <p>${property.description || ''}</p>
        `;

        if (propertyModalTitle) {
          propertyModalTitle.textContent = property.title || 'Детали объекта';
        }
        if (propertyModalContent) {
          propertyModalContent.innerHTML = modalHtml;
        }
        propertyModal.show();
      });
    }

    return card;
  }

  async function fetchProperties() {
    try {
      // Show loading indicator
      propertiesContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div><p class="mt-2">Загружаем объекты недвижимости...</p></div>';

      // Исправленный fetch запрос
      const response = await fetch('http://localhost:3000/api/properties.php');
      
      if (!response.ok) {
        throw new Error(`HTTP ошибка: ${response.status}`);
      }
      
      const data = await response.json();

      // Clear existing content
      propertiesContainer.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        propertiesContainer.innerHTML = '<div class="text-center py-5"><p>Объекты недвижимости не найдены.</p></div>';
        return;
      }

      // Process and display properties
      data.forEach(property => {
        const card = createPropertyCard(property);
        propertiesContainer.appendChild(card);
      });

      console.log(`Загружено ${data.length} объектов недвижимости`);

    } catch (error) {
      console.error('Ошибка при загрузке объектов:', error);
      propertiesContainer.innerHTML = `
        <div class="alert alert-danger text-center" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Не удалось загрузить объекты недвижимости. 
          <br><small>${error.message}</small>
          <br><button class="btn btn-sm btn-outline-primary mt-2" onclick="location.reload()">Попробовать снова</button>
        </div>
      `;
    }
  }

  // Запускаем загрузку свойств
  fetchProperties();

  // Добавляем обработчики для переключения вида
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');

  if (gridView && listView) {
    gridView.addEventListener('click', function() {
      this.classList.add('active');
      listView.classList.remove('active');
      propertiesContainer.classList.remove('list-view');
      propertiesContainer.classList.add('grid-view');
    });

    listView.addEventListener('click', function() {
      this.classList.add('active');
      gridView.classList.remove('active');
      propertiesContainer.classList.remove('grid-view');
      propertiesContainer.classList.add('list-view');
    });
  }

  // Обработчик для диапазона цен
  const priceRange = document.getElementById('priceRange');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');

  if (priceRange && minPrice && maxPrice) {
    priceRange.addEventListener('input', function() {
      maxPrice.textContent = formatPrice(this.value);
    });
  }
});

// Функция для повторной попытки (глобальная для использования в error сообщении)
window.retryLoad = function() {
  const propertiesContainer = document.getElementById('propertiesContainer');
  if (propertiesContainer) {
    propertiesContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div><p class="mt-2">Загружаем объекты недвижимости...</p></div>';
    setTimeout(() => {
      document.querySelector('[onclick="retryLoad()"]')?.click();
    }, 1000);
  }
};