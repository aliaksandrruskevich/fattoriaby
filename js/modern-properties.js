// Modern Properties with Realt.by Integration and Yandex Maps

class ModernProperties {
  constructor() {
    this.properties = [];
    this.currentProperty = null;
    this.map = null;
    this.init();
  }

  init() {
    this.loadProperties();
    this.initFilters();
    this.initViewOptions();
    this.initPagination();
    this.initModal();
  }

  async loadProperties() {
    try {
      this.showLoadingState();

      const response = await fetch('/api/properties.php?limit=50');
      const data = await response.json();

      this.properties = data;
      this.renderProperties(this.properties);
      this.updatePagination();

    } catch (error) {
      console.error('Error loading properties:', error);
      this.showError('Ошибка загрузки объектов недвижимости');
    } finally {
      this.hideLoadingState();
    }
  }

  showLoadingState() {
    const container = document.getElementById('propertiesContainer');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 12; i++) {
      container.appendChild(this.createSkeletonCard());
    }
  }

  hideLoadingState() {
    // Skeletons will be replaced by real content
  }

  createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'property-card skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="property-details">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-price"></div>
      </div>
    `;
    return card;
  }

  renderProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (properties.length === 0) {
      container.innerHTML = '<div class="no-properties">Объекты не найдены</div>';
      return;
    }

    properties.forEach(property => {
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });
  }

  createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'property-card modern-card';
    card.dataset.propertyId = property.id || Math.random().toString(36).substr(2, 9);

    const mainPhoto = property.photos && property.photos[0] ? property.photos[0] : 'https://via.placeholder.com/400x300?text=Нет+фото';

    // Determine badge type based on property type
    let badgeClass = 'badge-primary';
    let badgeText = 'Продажа';

    if (property.type && property.type.toLowerCase().includes('аренда')) {
      badgeClass = 'badge-success';
      badgeText = 'Аренда';
    }

    card.innerHTML = `
      <div class="card-image-container">
        <img src="${mainPhoto}" alt="${property.title}" class="property-img" loading="lazy">
        <div class="property-badge ${badgeClass}">${badgeText}</div>
        <div class="card-overlay">
          <div class="overlay-content">
            <button class="btn-favorite" onclick="modernProperties.toggleFavorite('${card.dataset.propertyId}')">
              <i class="fas fa-heart"></i>
            </button>
            <button class="btn-quick-view" onclick="modernProperties.showPropertyModal('${card.dataset.propertyId}')">
              <i class="fas fa-eye"></i> Быстрый просмотр
            </button>
          </div>
        </div>
      </div>
      <div class="property-details">
        <h5 class="property-title">${property.title || 'Объект недвижимости'}</h5>
        <p class="property-location">
          <i class="fas fa-map-marker-alt"></i> ${property.location || 'Минск'}
        </p>
        <div class="property-price">${this.formatPrice(property.price)}</div>
        <div class="property-features">
          ${this.renderFeatures(property.features)}
        </div>
        <div class="property-actions">
          <button class="btn-details" onclick="modernProperties.showPropertyModal('${card.dataset.propertyId}')">
            Подробнее
          </button>
          <button class="btn-contact" onclick="modernProperties.showContactForm('${card.dataset.propertyId}')">
            Связаться
          </button>
        </div>
      </div>
    `;

    // Add click handler to the entire card
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-favorite') && !e.target.closest('.btn-quick-view') && !e.target.closest('.btn-details') && !e.target.closest('.btn-contact')) {
        this.showPropertyModal(card.dataset.propertyId);
      }
    });

    return card;
  }

  formatPrice(price) {
    if (!price) return 'Цена по запросу';

    if (typeof price === 'string') {
      return price;
    }

    return new Intl.NumberFormat('ru-RU').format(price) + ' $';
  }

  renderFeatures(features) {
    if (!features || !Array.isArray(features)) return '';

    return features.slice(0, 4).map(feature =>
      `<span class="feature-tag">${feature}</span>`
    ).join('');
  }

  showPropertyModal(propertyId) {
    const property = this.properties.find(p => (p.id || p.title) === propertyId);
    if (!property) return;

    this.currentProperty = property;

    const modal = document.getElementById('propertyModal');
    const modalTitle = document.getElementById('propertyModalTitle');
    const modalContent = document.getElementById('propertyModalContent');

    modalTitle.textContent = property.title || 'Объект недвижимости';

    modalContent.innerHTML = this.createPropertyModalContent(property);

    // Initialize Yandex Map
    this.initPropertyMap(property);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  createPropertyModalContent(property) {
    const photos = property.photos || [];
    const mainPhoto = photos[0] || 'https://via.placeholder.com/800x600?text=Нет+фото';

    return `
      <div class="property-modal-content">
        <div class="row">
          <div class="col-lg-8">
            <div class="property-gallery">
              <div class="main-image">
                <img src="${mainPhoto}" alt="${property.title}" id="mainPropertyImage">
              </div>
              ${photos.length > 1 ? `
                <div class="thumbnail-gallery">
                  ${photos.slice(0, 6).map((photo, index) => `
                    <img src="${photo}" alt="Фото ${index + 1}" onclick="modernProperties.changeMainImage('${photo}')" class="${index === 0 ? 'active' : ''}">
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="col-lg-4">
            <div class="property-info">
              <h4>${property.title || 'Объект недвижимости'}</h4>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i> ${property.location || 'Минск'}
              </p>
              <div class="price">${this.formatPrice(property.price)}</div>

              <div class="features-list">
                <h5>Характеристики:</h5>
                <ul>
                  ${property.features ? property.features.map(feature => `<li>${feature}</li>`).join('') : '<li>Информация уточняется</li>'}
                </ul>
              </div>

              <div class="property-description">
                <h5>Описание:</h5>
                <p>${property.description || 'Подробное описание объекта'}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-12">
            <div id="propertyMap" style="height: 300px; width: 100%;"></div>
          </div>
        </div>
      </div>
    `;
  }

  initPropertyMap(property) {
    // Initialize Yandex Map for the property
    if (typeof ymaps !== 'undefined') {
      ymaps.ready(() => {
        const mapContainer = document.getElementById('propertyMap');
        if (!mapContainer) return;

        // Try to geocode the location
        const location = property.location || 'Минск';
        ymaps.geocode(location).then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          const coords = firstGeoObject.geometry.getCoordinates();

          this.map = new ymaps.Map('propertyMap', {
            center: coords,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl']
          });

          // Add placemark
          const placemark = new ymaps.Placemark(coords, {
            hintContent: property.title,
            balloonContent: `${property.title}<br>${location}`
          });

          this.map.geoObjects.add(placemark);
        }).catch(() => {
          // Fallback to Minsk center
          this.map = new ymaps.Map('propertyMap', {
            center: [53.9045, 27.5615],
            zoom: 10
          });
        });
      });
    }
  }

  changeMainImage(src) {
    const mainImage = document.getElementById('mainPropertyImage');
    if (mainImage) {
      mainImage.src = src;
    }

    // Update active thumbnail
    document.querySelectorAll('.thumbnail-gallery img').forEach(img => {
      img.classList.remove('active');
    });
    event.target.classList.add('active');
  }

  toggleFavorite(propertyId) {
    // Implementation for favorites
    console.log('Toggle favorite:', propertyId);
  }

  showContactForm(propertyId) {
    // Implementation for contact form
    console.log('Show contact form for:', propertyId);
  }

  initFilters() {
    // Initialize filter functionality
    const filterButton = document.querySelector('.btn-primary-custom');
    if (filterButton) {
      filterButton.addEventListener('click', () => {
        this.applyFilters();
      });
    }
  }

  applyFilters() {
    // Apply filters to properties
    const filteredProperties = this.properties; // Add actual filtering logic
    this.renderProperties(filteredProperties);
  }

  initViewOptions() {
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const container = document.getElementById('propertiesContainer');

    if (gridView && listView && container) {
      gridView.addEventListener('click', () => {
        container.classList.remove('properties-list');
        container.classList.add('properties-grid');
        gridView.classList.add('active');
        listView.classList.remove('active');
      });

      listView.addEventListener('click', () => {
        container.classList.remove('properties-grid');
        container.classList.add('properties-list');
        listView.classList.add('active');
        gridView.classList.remove('active');
      });
    }
  }

  initPagination() {
    // Initialize pagination
  }

  updatePagination() {
    // Update pagination controls
  }

  initModal() {
    // Initialize modal functionality
  }

  showError(message) {
    // Show error message
    console.error(message);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.modernProperties = new ModernProperties();
});
