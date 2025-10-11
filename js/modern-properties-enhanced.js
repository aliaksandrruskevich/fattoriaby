// Enhanced Modern Properties with Realt.by Integration and Yandex Maps

class ModernProperties {
  constructor() {
    this.properties = [];
    this.filteredProperties = [];
    this.currentProperty = null;
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.sortBy = 'date'; // date, price_asc, price_desc, area
    this.searchQuery = '';
    this.filters = {
      type: '',
      district: '',
      rooms: '',
      priceMax: 500000,
      areaMin: 0,
      areaMax: Infinity,
      balcony: false,
      parking: false,
      renovation: false,
      status: 'active' // active, sold, reserved
    };
    this.lastUpdate = null;
    this.updateInterval = 15 * 60 * 1000; // 15 minutes
    this.cache = new Map(); // For API response caching
    this.map = null;
    this.init();
  }

  init() {
    this.loadProperties();
    this.initFilters();
    this.initViewOptions();
    this.initPagination();
    this.initModal();
    this.initSorting();
    this.initAutoUpdate();
    this.initErrorHandling();
    this.initURLHandling();
  }

  async loadProperties(silent = false) {
    const cacheKey = 'properties_data';
    const cached = this.cache.get(cacheKey);

    // Use cache if less than 5 minutes old
    if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
      this.properties = cached.data;
      if (!silent) {
        this.renderProperties(this.properties);
        this.updatePagination();
      }
      return;
    }

    if (!silent) {
      this.showLoadingState();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/properties.php?limit=100', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Неверный формат данных от сервера');
      }

      this.properties = data;
      this.cache.set(cacheKey, { data: this.properties, timestamp: Date.now() });

      if (!silent) {
        this.renderProperties(this.properties);
        this.updatePagination();
        this.updateLastUpdateTime();
      }

    } catch (error) {
      console.error('Error loading properties:', error);

      if (error.name === 'AbortError') {
        this.showError('Превышено время ожидания ответа от сервера');
      } else if (error.message.includes('HTTP')) {
        this.showError(`Ошибка сервера: ${error.message}`);
      } else {
        this.showError('Не удалось загрузить объекты недвижимости. Проверьте подключение к интернету.');
      }

      // Try to use cached data as fallback
      if (cached) {
        this.properties = cached.data;
        if (!silent) {
          this.renderProperties(this.properties);
          this.showNotification('Показаны сохраненные данные', 'warning');
        }
      }
    } finally {
      if (!silent) {
        this.hideLoadingState();
      }
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

    // Initialize search
    this.initSearch();

    // Initialize range sliders
    this.initRangeSliders();

    // Initialize checkboxes
    this.initCheckboxes();

    // Initialize select filters
    this.initSelectFilters();
  }

  initSearch() {
    const searchInput = document.getElementById('propertySearch');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this.applyFilters();
        }, 300); // Debounce search
      });
    }
  }

  initRangeSliders() {
    const priceRange = document.getElementById('priceRange');
    const minPriceSpan = document.getElementById('minPrice');
    const maxPriceSpan = document.getElementById('maxPrice');

    if (priceRange && minPriceSpan && maxPriceSpan) {
      priceRange.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const max = parseInt(e.target.max);

        minPriceSpan.textContent = value.toLocaleString() + ' $';
        maxPriceSpan.textContent = max.toLocaleString() + ' $';

        this.filters.priceMax = value;
        this.applyFilters();
      });

      // Initialize display
      const initialValue = parseInt(priceRange.value);
      const maxValue = parseInt(priceRange.max);
      minPriceSpan.textContent = initialValue.toLocaleString() + ' $';
      maxPriceSpan.textContent = maxValue.toLocaleString() + ' $';
      this.filters.priceMax = initialValue;
    }

    // Area range inputs
    const minAreaInput = document.getElementById('minArea');
    const maxAreaInput = document.getElementById('maxArea');

    if (minAreaInput) {
      minAreaInput.addEventListener('input', (e) => {
        this.filters.areaMin = parseInt(e.target.value) || 0;
        this.applyFilters();
      });
    }

    if (maxAreaInput) {
      maxAreaInput.addEventListener('input', (e) => {
        this.filters.areaMax = parseInt(e.target.value) || Infinity;
        this.applyFilters();
      });
    }
  }

  initCheckboxes() {
    const checkboxes = document.querySelectorAll('.filter-section input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.filters.balcony = document.getElementById('balconyCheck').checked;
        this.filters.parking = document.getElementById('parkingCheck').checked;
        this.filters.renovation = document.getElementById('renovationCheck').checked;
        this.applyFilters();
      });
    });
  }

  initSelectFilters() {
    const selects = document.querySelectorAll('.filter-section select');
    selects.forEach((select, index) => {
      select.addEventListener('change', () => {
        if (index === 0) this.filters.type = select.value;
        if (index === 1) this.filters.district = select.value;
        if (index === 2) this.filters.rooms = select.value;
        this.applyFilters();
      });
    });
  }

  applyFilters() {
    let filteredProperties = [...this.properties];

    // Search filter
    if (this.searchQuery) {
      filteredProperties = filteredProperties.filter(property => {
        const title = property.title?.toLowerCase() || '';
        const location = property.location?.toLowerCase() || '';
        const description = property.description?.toLowerCase() || '';

        return title.includes(this.searchQuery) ||
               location.includes(this.searchQuery) ||
               description.includes(this.searchQuery);
      });
    }

    // Type filter
    if (this.filters.type && this.filters.type !== 'Все типы') {
      filteredProperties = filteredProperties.filter(property => {
        const propertyType = property.type?.toLowerCase() || '';
        const selectedType = this.filters.type.toLowerCase();
        return propertyType.includes(selectedType);
      });
    }

    // District filter
    if (this.filters.district && this.filters.district !== 'Все районы') {
      filteredProperties = filteredProperties.filter(property => {
        const location = property.location?.toLowerCase() || '';
        const selectedDistrict = this.filters.district.toLowerCase();
        return location.includes(selectedDistrict);
      });
    }

    // Rooms filter
    if (this.filters.rooms && this.filters.rooms !== 'Любое') {
      filteredProperties = filteredProperties.filter(property => {
        const features = property.features || [];
        const roomsFeature = features.find(f => f.toLowerCase().includes('комнат'));
        if (!roomsFeature) return false;

        const roomsCount = parseInt(roomsFeature.match(/\d+/));
        const selectedRooms = this.filters.rooms;

        if (selectedRooms === '5+') {
          return roomsCount >= 5;
        }
        return roomsCount === parseInt(selectedRooms);
      });
    }

    // Price filter
    if (this.filters.priceMax > 0) {
      filteredProperties = filteredProperties.filter(property => {
        const price = this.parsePrice(property.price);
        return price <= this.filters.priceMax;
      });
    }

    // Area filters
    if (this.filters.areaMin > 0 || this.filters.areaMax < Infinity) {
      filteredProperties = filteredProperties.filter(property => {
        const features = property.features || [];
        const areaFeature = features.find(f => f.toLowerCase().includes('площадь') || f.toLowerCase().includes('площади'));
        if (!areaFeature) return true; // If no area info, include

        const areaMatch = areaFeature.match(/(\d+(?:\.\d+)?)/);
        if (!areaMatch) return true;

        const area = parseFloat(areaMatch[1]);
        return area >= this.filters.areaMin && area <= this.filters.areaMax;
      });
    }

    // Additional filters (checkboxes)
    if (this.filters.balcony) {
      filteredProperties = filteredProperties.filter(property => {
        const description = property.description?.toLowerCase() || '';
        const features = property.features?.join(' ').toLowerCase() || '';
        return description.includes('балкон') || description.includes('лоджия') ||
               features.includes('балкон') || features.includes('лоджия');
      });
    }

    if (this.filters.parking) {
      filteredProperties = filteredProperties.filter(property => {
        const description = property.description?.toLowerCase() || '';
        const features = property.features?.join(' ').toLowerCase() || '';
        return description.includes('парковк') || features.includes('парковк');
      });
    }

    if (this.filters.renovation) {
      filteredProperties = filteredProperties.filter(property => {
        const description = property.description?.toLowerCase() || '';
        const features = property.features?.join(' ').toLowerCase() || '';
        return description.includes('ремонт') || features.includes('ремонт');
      });
    }

    // Sort properties
    filteredProperties = this.sortProperties(filteredProperties);

    // Update results count
    this.updateResultsCount(filteredProperties.length);

    // Store filtered properties for pagination
    this.filteredProperties = filteredProperties;

    // Render current page
    this.renderCurrentPage();
  }

  sortProperties(properties) {
    return [...properties].sort((a, b) => {
      switch (this.sortBy) {
        case 'price_asc':
          return this.parsePrice(a.price) - this.parsePrice(b.price);
        case 'price_desc':
          return this.parsePrice(b.price) - this.parsePrice(a.price);
        case 'area':
          return this.getAreaValue(b) - this.getAreaValue(a);
        case 'date':
        default:
          // Assuming newer properties have higher IDs or we can use date if available
          return (b.id || 0) - (a.id || 0);
      }
    });
  }

  getAreaValue(property) {
    const features = property.features || [];
    const areaFeature = features.find(f => f.toLowerCase().includes('площадь') || f.toLowerCase().includes('площади'));
    if (!areaFeature) return 0;

    const areaMatch = areaFeature.match(/(\d+(?:\.\d+)?)/);
    return areaMatch ? parseFloat(areaMatch[1]) : 0;
  }

  parsePrice(priceString) {
    if (typeof priceString === 'number') return priceString;
    if (!priceString) return 0;

    // Remove spaces and extract numbers
    const cleaned = priceString.replace(/\s+/g, '');
    const match = cleaned.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  updateResultsCount(count) {
    const button = document.querySelector('.btn-primary-custom');
    if (button) {
      button.textContent = `Показать ${count} объектов`;
    }

    const countElement = document.getElementById('count');
    if (countElement) {
      countElement.textContent = count;
    }
  }

  renderCurrentPage() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageProperties = this.filteredProperties.slice(startIndex, endIndex);

    this.renderProperties(pageProperties);
    this.updatePagination();
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
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreProperties();
      });
    }

    // Alternative: traditional pagination
    this.initTraditionalPagination();
  }

  loadMoreProperties() {
    const nextPage = this.currentPage + 1;
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    if (startIndex < this.filteredProperties.length) {
      const newProperties = this.filteredProperties.slice(startIndex, endIndex);
      this.appendProperties(newProperties);
      this.currentPage = nextPage;

      // Hide load more button if no more properties
      if (endIndex >= this.filteredProperties.length) {
        document.getElementById('loadMoreBtn').style.display = 'none';
      }
    }
  }

  appendProperties(properties) {
    const container = document.getElementById('propertiesContainer');
    if (!container) return;

    properties.forEach(property => {
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });
  }

  initTraditionalPagination() {
    // Traditional pagination logic can be added here
  }

  updatePagination() {
    // Update pagination controls
  }

  initModal() {
    // Initialize modal functionality
  }

  initSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }
  }

  initAutoUpdate() {
    // Auto-update data every 15 minutes
    setInterval(() => {
      this.loadProperties(true); // Silent update
    }, this.updateInterval);

    // Update last update timestamp
    this.updateLastUpdateTime();
  }

  initErrorHandling() {
    // Global error handler for API calls
    window.addEventListener('unhandledrejection', (event) => {
      console.error('API Error:', event.reason);
      this.showError('Произошла ошибка при загрузке данных. Попробуйте обновить страницу.');
    });
  }

  initURLHandling() {
    // Handle URL parameters for direct property links
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('property');

    if (propertyId) {
      // Load specific property details
      this.loadPropertyDetails(propertyId);
    }
  }

  async loadPropertyDetails(propertyId) {
    try {
      const response = await fetch(`/api/properties.php?id=${propertyId}`);
      const property = await response.json();

      if (property) {
        this.showPropertyModal(property.id || property.title);
      }
    } catch (error) {
      console.error('Error loading property details:', error);
      this.showError('Не удалось загрузить детали объекта');
    }
  }

  updateLastUpdateTime() {
    this.lastUpdate = new Date();
    const updateElement = document.getElementById('lastUpdate');
    if (updateElement) {
      updateElement.textContent = `Обновлено: ${this.lastUpdate.toLocaleTimeString('ru-RU')}`;
    }
  }

  showNotification(message, type = 'info') {
    // Use existing toast system or create notification
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      // Fallback notification
      const notification = document.createElement('div');
      notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`;
      notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      notification.innerHTML = `
        <div class="d-flex align-items-center">
          <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
          ${message}
        </div>
      `;

      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  // Security: Sanitize user input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>]/g, '').trim();
  }

  // Performance: Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Admin features (for development/admin access)
  initAdminFeatures() {
    // Only enable if user has admin privileges
    if (this.isAdmin()) {
      this.addAdminControls();
    }
  }

  isAdmin() {
    // Check for admin cookie or session
    return document.cookie.includes('admin=true');
  }

  addAdminControls() {
    const adminPanel = document.createElement('div');
    adminPanel.id = 'adminPanel';
    adminPanel.innerHTML = `
      <div class="admin-controls">
        <button onclick="modernProperties.forceUpdate()">Принудительное обновление</button>
        <button onclick="modernProperties.clearCache()">Очистить кэш</button>
        <span id="lastUpdate"></span>
      </div>
    `;
    document.body.appendChild(adminPanel);
  }

  forceUpdate() {
    this.cache.clear();
    this.loadProperties();
  }

  clearCache() {
    this.cache.clear();
    this.showNotification('Кэш очищен', 'success');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.modernProperties = new ModernProperties();
});
