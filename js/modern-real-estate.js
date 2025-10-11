// Modern Real Estate Interactive Features

class ModernRealEstate {
  constructor() {
    this.favorites = this.loadFavorites();
    this.comparisonList = [];
    this.currentLightboxImage = null;
    this.init();
  }

  init() {
    this.initPropertyCards();
    this.initFilters();
    this.initComparison();
    this.initLightbox();
    this.initFavorites();
    this.initAPI();
    this.initLoadingStates();
  }

  // Initialize property cards with modern interactions
  initPropertyCards() {
    const cards = document.querySelectorAll('.modern-property-card');
    cards.forEach(card => {
      // Add hover effects
      card.addEventListener('mouseenter', (e) => {
        this.handleCardHover(e, true);
      });

      card.addEventListener('mouseleave', (e) => {
        this.handleCardHover(e, false);
      });

      // Add click handlers
      const image = card.querySelector('img');
      if (image) {
        image.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openLightbox(image.src, image.alt);
        });
      }

      // Add favorite button
      this.addFavoriteButton(card);

      // Add comparison button
      this.addComparisonButton(card);
    });
  }

  handleCardHover(event, isHover) {
    const card = event.currentTarget;
    const image = card.querySelector('img');

    if (isHover) {
      card.style.transform = 'translateY(-12px) scale(1.02)';
      if (image) {
        image.style.transform = 'scale(1.1)';
      }
    } else {
      card.style.transform = '';
      if (image) {
        image.style.transform = '';
      }
    }
  }

  // Add favorite button to property cards
  addFavoriteButton(card) {
    const propertyId = card.dataset.propertyId || Math.random().toString(36).substr(2, 9);
    card.dataset.propertyId = propertyId;

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.innerHTML = '<i class="fas fa-heart"></i>';
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleFavorite(propertyId, favoriteBtn);
    });

    if (this.favorites.includes(propertyId)) {
      favoriteBtn.classList.add('active');
      favoriteBtn.querySelector('i').style.color = '#ff4757';
    }

    card.appendChild(favoriteBtn);
  }

  // Add comparison button to property cards
  addComparisonButton(card) {
    const propertyId = card.dataset.propertyId;
    const compareBtn = document.createElement('button');
    compareBtn.className = 'btn-modern compare-btn';
    compareBtn.innerHTML = '<span>Сравнить</span>';
    compareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleComparison(propertyId, card);
    });

    const cardBody = card.querySelector('.card-body') || card;
    cardBody.appendChild(compareBtn);
  }

  // Toggle favorite status
  toggleFavorite(propertyId, button) {
    const index = this.favorites.indexOf(propertyId);
    if (index > -1) {
      this.favorites.splice(index, 1);
      button.classList.remove('active');
      button.querySelector('i').style.color = '#ddd';
      this.showNotification('Удалено из избранного', 'info');
    } else {
      this.favorites.push(propertyId);
      button.classList.add('active');
      button.querySelector('i').style.color = '#ff4757';
      this.showNotification('Добавлено в избранное', 'success');
    }
    this.saveFavorites();
  }

  // Toggle comparison
  toggleComparison(propertyId, card) {
    const index = this.comparisonList.indexOf(propertyId);
    if (index > -1) {
      this.comparisonList.splice(index, 1);
      this.showNotification('Удалено из сравнения', 'info');
    } else {
      if (this.comparisonList.length >= 4) {
        this.showNotification('Максимум 4 объекта для сравнения', 'warning');
        return;
      }
      this.comparisonList.push(propertyId);
      this.showNotification('Добавлено к сравнению', 'success');
    }
    this.updateComparisonBar();
  }

  // Update comparison bar
  updateComparisonBar() {
    let comparisonBar = document.querySelector('.comparison-bar');
    if (!comparisonBar) {
      comparisonBar = document.createElement('div');
      comparisonBar.className = 'comparison-bar';
      comparisonBar.innerHTML = `
        <div class="container">
          <div class="d-flex justify-content-between align-items-center">
            <div class="comparison-items"></div>
            <button class="btn-modern compare-action-btn">
              <span>Сравнить (${this.comparisonList.length})</span>
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(comparisonBar);

      comparisonBar.querySelector('.compare-action-btn').addEventListener('click', () => {
        this.openComparisonModal();
      });
    }

    const itemsContainer = comparisonBar.querySelector('.comparison-items');
    itemsContainer.innerHTML = '';

    this.comparisonList.forEach(id => {
      const item = document.createElement('div');
      item.className = 'comparison-item';
      item.innerHTML = `
        <span>Объект ${id.slice(0, 6)}</span>
        <button class="ms-2" onclick="modernRealEstate.removeFromComparison('${id}')">&times;</button>
      `;
      itemsContainer.appendChild(item);
    });

    comparisonBar.classList.toggle('visible', this.comparisonList.length > 0);
  }

  removeFromComparison(propertyId) {
    const index = this.comparisonList.indexOf(propertyId);
    if (index > -1) {
      this.comparisonList.splice(index, 1);
      this.updateComparisonBar();
      this.showNotification('Удалено из сравнения', 'info');
    }
  }

  // Open comparison modal
  openComparisonModal() {
    if (this.comparisonList.length === 0) return;

    const modal = document.createElement('div');
    modal.className = 'modal fade modern-modal';
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Сравнение объектов</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="comparison-table">
              <!-- Comparison table will be populated here -->
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  }

  // Initialize filters
  initFilters() {
    const filterForm = document.querySelector('.modern-filter-section form');
    if (!filterForm) return;

    // Convert select elements to modern chips
    const selects = filterForm.querySelectorAll('select');
    selects.forEach(select => {
      this.convertSelectToChips(select);
    });

    // Handle range sliders
    const rangeSliders = filterForm.querySelectorAll('input[type="range"]');
    rangeSliders.forEach(slider => {
      slider.classList.add('modern-range-slider');
      slider.addEventListener('input', () => {
        this.updateRangeDisplay(slider);
        this.filterProperties();
      });
    });

    // Handle form submission
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.filterProperties();
    });
  }

  convertSelectToChips(select) {
    const container = document.createElement('div');
    container.className = 'filter-chips-container';
    select.parentNode.replaceChild(container, select);

    const options = Array.from(select.options);
    options.forEach(option => {
      if (option.value) {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.textContent = option.text;
        chip.dataset.value = option.value;
        chip.addEventListener('click', () => {
          chip.classList.toggle('active');
          this.filterProperties();
        });
        container.appendChild(chip);
      }
    });
  }

  updateRangeDisplay(slider) {
    const display = slider.parentNode.querySelector('.range-display');
    if (display) {
      display.textContent = slider.value;
    }
  }

  filterProperties() {
    // Show loading state
    this.showLoadingState();

    // Get filter values
    const activeChips = document.querySelectorAll('.filter-chip.active');
    const filters = {};

    activeChips.forEach(chip => {
      const category = chip.closest('.filter-chips-container').dataset.category || 'general';
      if (!filters[category]) filters[category] = [];
      filters[category].push(chip.dataset.value);
    });

    // Apply filters (this would connect to API in real implementation)
    setTimeout(() => {
      this.hideLoadingState();
      this.showNotification('Фильтры применены', 'success');
    }, 1000);
  }

  // Initialize lightbox
  initLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="" alt="">
        <button class="lightbox-close">&times;</button>
        <button class="lightbox-prev">&larr;</button>
        <button class="lightbox-next">&rarr;</button>
      </div>
    `;
    document.body.appendChild(lightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
        this.closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.navigateLightbox(-1);
          break;
        case 'ArrowRight':
          this.navigateLightbox(1);
          break;
      }
    });
  }

  openLightbox(src, alt) {
    const lightbox = document.querySelector('.lightbox');
    const img = lightbox.querySelector('img');
    img.src = src;
    img.alt = alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  navigateLightbox(direction) {
    // Implementation for navigating through gallery
    console.log('Navigate lightbox:', direction);
  }

  // Initialize API connection
  initAPI() {
    // Load properties from API
    this.loadProperties();
  }

  async loadProperties() {
    try {
      this.showLoadingState();

      // Mock API call - replace with real API endpoint
      const response = await fetch('/api/properties.php');
      const properties = await response.json();

      this.renderProperties(properties);
    } catch (error) {
      console.error('Error loading properties:', error);
      this.showNotification('Ошибка загрузки данных', 'error');
    } finally {
      this.hideLoadingState();
    }
  }

  renderProperties(properties) {
    const container = document.querySelector('.properties-container');
    if (!container) return;

    container.innerHTML = '';

    properties.forEach(property => {
      const card = this.createPropertyCard(property);
      container.appendChild(card);
    });

    // Re-initialize interactions for new cards
    this.initPropertyCards();
  }

  createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'modern-property-card';
    card.dataset.propertyId = property.id;

    card.innerHTML = `
      <div class="position-relative">
        <img src="${property.image}" alt="${property.title}" loading="lazy">
      </div>
      <div class="card-body">
        <h5 class="card-title">${property.title}</h5>
        <p class="card-text">${property.description}</p>
        <div class="property-price">${property.price}</div>
        <div class="property-features">
          ${property.features.map(feature => `<span class="feature">${feature}</span>`).join('')}
        </div>
      </div>
    `;

    return card;
  }

  // Loading states
  initLoadingStates() {
    // Add loading skeletons
    this.createSkeletonLoader();
  }

  showLoadingState() {
    const container = document.querySelector('.properties-container');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const skeleton = this.createSkeletonCard();
      container.appendChild(skeleton);
    }
  }

  hideLoadingState() {
    // Skeletons will be replaced by real content
  }

  createSkeletonCard() {
    const card = document.createElement('div');
    card.className = 'modern-property-card skeleton-card';
    card.innerHTML = `
      <div class="skeleton skeleton-image"></div>
      <div class="card-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text"></div>
      </div>
    `;
    return card;
  }

  // Favorites management
  initFavorites() {
    // Favorites are already handled in addFavoriteButton
  }

  loadFavorites() {
    return JSON.parse(localStorage.getItem('realEstateFavorites') || '[]');
  }

  saveFavorites() {
    localStorage.setItem('realEstateFavorites', JSON.stringify(this.favorites));
  }

  // Notification system
  showNotification(message, type = 'info') {
    // Use existing toast system or create new
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      // Fallback notification
      const notification = document.createElement('div');
      notification.className = `alert alert-${type === 'error' ? 'danger' : type} notification`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
      `;

      document.body.appendChild(notification);
      setTimeout(() => {
        notification.remove();
      }, 3000);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.modernRealEstate = new ModernRealEstate();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernRealEstate;
}
