AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

const propertiesContainer = document.getElementById('propertiesContainer');
const propertyModal = new bootstrap.Modal(document.getElementById('propertyModal'));
const propertyModalTitle = document.getElementById('propertyModalTitle');
const propertyModalContent = document.getElementById('propertyModalContent');

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function createPropertyCard(property) {
  const card = document.createElement('div');
  card.className = 'property-card';
  card.setAttribute('data-aos', 'fade-up');

  const imgSrc = property.photos && property.photos.length > 0 ? property.photos[0] : '';
  const imgAlt = property.title || 'Объект недвижимости';

  // Features list HTML
  let featuresHtml = '<ul class="property-features">';
  if (property.features) {
    property.features.forEach(feature => {
      featuresHtml += `<li>${feature}</li>`;
    });
  }
  featuresHtml += '</ul>';

  card.innerHTML = `
    <div class="position-relative">
      <img src="${imgSrc}" class="property-img w-100" alt="${imgAlt}">
      <span class="property-badge badge-primary">${property.type || 'Недвижимость'}</span>
    </div>
    <div class="property-details">
      <h5>${property.title || ''}</h5>
      <p class="text-muted">${property.location || ''}</p>
      <div class="property-price">${formatPrice(property.price) || ''} $</div>
      ${featuresHtml}
      <p>${property.description || ''}</p>
      <div class="d-grid gap-2">
        <button class="btn btn-outline-primary">Подробнее</button>
        <button class="btn btn-primary-custom">Запрос на просмотр</button>
      </div>
    </div>
  `;

  // Add event listener for "Подробнее" button
  const detailsBtn = card.querySelector('.btn-outline-primary');
  detailsBtn.addEventListener('click', () => {
    let featuresListHtml = '<ul class="list-unstyled">';
    if (property.features) {
      property.features.forEach(f => {
        featuresListHtml += `<li>${f}</li>`;
      });
    }
    featuresListHtml += '</ul>';

    const modalHtml = `
      <img src="${imgSrc}" alt="${imgAlt}" class="img-fluid mb-3" />
      <h5>${property.title || ''}</h5>
      <p class="text-muted">${property.location || ''}</p>
      <div class="property-price mb-3">${formatPrice(property.price) || ''} $</div>
      ${featuresListHtml}
      <p>${property.description || ''}</p>
    `;

    propertyModalTitle.textContent = property.title || '';
    propertyModalContent.innerHTML = modalHtml;
    propertyModal.show();
  });

  return card;
}

async function fetchProperties() {
  try {
    // Show loading indicator
    propertiesContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div><p class="mt-2">Загружаем объекты недвижимости...</p></div>';

fetch('http://localhost:3000/api/properties.php')
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

    console.log(`Загружено ${data.length} объектов недвижимости из API realt.by`);

  } catch (error) {
    console.error('Ошибка при загрузке объектов:', error);
    propertiesContainer.innerHTML = '<div class="alert alert-danger text-center" role="alert"><i class="fas fa-exclamation-triangle me-2"></i>Не удалось загрузить объекты недвижимости. Попробуйте обновить страницу.</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProperties();

  // Other UI event listeners (back to top, view toggle, price range) can be kept here or moved as needed
});
