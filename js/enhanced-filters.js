document.addEventListener('DOMContentLoaded', function () {
  // Enhanced filter elements
  const applyFiltersBtn = document.getElementById('applyFilters');
  const typeFilter = document.getElementById('typeFilter');
  const districtFilter = document.getElementById('districtFilter');
  const minPriceFilter = document.getElementById('minPrice');
  const maxPriceFilter = document.getElementById('maxPrice');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const specialCards = document.querySelectorAll('#specials .col-md-4');
  const resultsCount = document.getElementById('resultsCount');
  const clearFiltersBtn = document.getElementById('clearFilters');

  // Real-time filtering variables
  let filterTimeout;
  let currentFilters = {
    type: '',
    district: '',
    minPrice: 0,
    maxPrice: Infinity,
    search: '',
    sort: 'default'
  };

  // Initialize enhanced filters
  initializeEnhancedFilters();

  function initializeEnhancedFilters() {
    // Add real-time filtering with debouncing
    if (typeFilter) typeFilter.addEventListener('change', () => applyFilters(true));
    if (districtFilter) districtFilter.addEventListener('input', () => applyFilters(true));
    if (minPriceFilter) minPriceFilter.addEventListener('input', () => applyFilters(true));
    if (maxPriceFilter) maxPriceFilter.addEventListener('input', () => applyFilters(true));
    if (searchInput) searchInput.addEventListener('input', () => applyFilters(true));
    if (sortSelect) sortSelect.addEventListener('change', () => applyFilters(true));

    // Apply filters button (fallback)
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => applyFilters(false));
    }

    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearAllFilters);
    }

    // Add loading animation to filter button
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Поиск...';
        this.disabled = true;
        setTimeout(() => {
          this.innerHTML = 'Применить';
          this.disabled = false;
        }, 1000);
      });
    }

    // Add search input enhancements
    if (searchInput) {
      searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('search-focused');
      });

      searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('search-focused');
      });

      // Add clear search button
      const clearSearchBtn = document.createElement('button');
      clearSearchBtn.type = 'button';
      clearSearchBtn.className = 'btn btn-sm btn-outline-secondary clear-search';
      clearSearchBtn.innerHTML = '<i class="fas fa-times"></i>';
      clearSearchBtn.style.display = 'none';
      clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        applyFilters(true);
      });

      searchInput.parentElement.appendChild(clearSearchBtn);

      searchInput.addEventListener('input', function() {
        clearSearchBtn.style.display = this.value ? 'block' : 'none';
      });
    }

    // Add price range visual feedback
    [minPriceFilter, maxPriceFilter].forEach(input => {
      if (input) {
        input.addEventListener('input', function() {
          this.classList.add('price-active');
          setTimeout(() => this.classList.remove('price-active'), 300);
        });
      }
    });
  }

  function applyFilters(realTime = false) {
    // Update current filters
    currentFilters = {
      type: typeFilter ? typeFilter.value.toLowerCase() : '',
      district: districtFilter ? districtFilter.value.toLowerCase() : '',
      minPrice: minPriceFilter ? (parseInt(minPriceFilter.value) || 0) : 0,
      maxPrice: maxPriceFilter ? (parseInt(maxPriceFilter.value) || Infinity) : Infinity,
      search: searchInput ? searchInput.value.toLowerCase() : '',
      sort: sortSelect ? sortSelect.value : 'default'
    };

    if (realTime) {
      // Debounce real-time filtering
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
        filterAndSortCards();
      }, 300);
    } else {
      filterAndSortCards();
    }
  }

  function filterAndSortCards() {
    let visibleCount = 0;
    const cardsArray = Array.from(specialCards);

    cardsArray.forEach(card => {
      const cardType = card.getAttribute('data-type') || '';
      const cardDistrict = card.getAttribute('data-district') || '';
      const cardPrice = parseInt(card.getAttribute('data-price')) || 0;
      const cardTitle = card.querySelector('h5') ? card.querySelector('h5').textContent.toLowerCase() : '';
      const cardDesc = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : '';

      // Check filters
      const typeMatch = !currentFilters.type || cardType.includes(currentFilters.type);
      const districtMatch = !currentFilters.district || cardDistrict.includes(currentFilters.district);
      const priceMatch = cardPrice >= currentFilters.minPrice && cardPrice <= currentFilters.maxPrice;
      const searchMatch = !currentFilters.search ||
        cardTitle.includes(currentFilters.search) ||
        cardDesc.includes(currentFilters.search) ||
        cardType.includes(currentFilters.search) ||
        cardDistrict.includes(currentFilters.search);

      const shouldShow = typeMatch && districtMatch && priceMatch && searchMatch;

      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = 'fadeInUp 0.5s ease-out';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Sort visible cards
    sortVisibleCards(cardsArray);

    // Update results count
    updateResultsCount(visibleCount);

    // Add visual feedback
    addFilterFeedback(visibleCount);
  }

  function sortVisibleCards(cardsArray) {
    const container = document.querySelector('#specials .row');
    if (!container || currentFilters.sort === 'default') return;

    const visibleCards = cardsArray.filter(card => card.style.display !== 'none');

    visibleCards.sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price')) || 0;
      const priceB = parseInt(b.getAttribute('data-price')) || 0;

      switch (currentFilters.sort) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'title':
          const titleA = a.querySelector('h5').textContent.toLowerCase();
          const titleB = b.querySelector('h5').textContent.toLowerCase();
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });

    // Reorder DOM elements
    visibleCards.forEach(card => {
      container.appendChild(card);
    });
  }

  function updateResultsCount(count) {
    if (resultsCount) {
      resultsCount.textContent = `Найдено: ${count} ${getWordForm(count, ['объект', 'объекта', 'объектов'])}`;
      resultsCount.style.opacity = count === 0 ? '0.6' : '1';
    }
  }

  function getWordForm(number, words) {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
  }

  function addFilterFeedback(count) {
    // Add visual feedback when no results
    const specialsSection = document.getElementById('specials');
    const existingNoResults = document.querySelector('.no-results-message');

    if (existingNoResults) {
      existingNoResults.remove();
    }

    if (count === 0) {
      const noResultsDiv = document.createElement('div');
      noResultsDiv.className = 'no-results-message text-center py-5';
      noResultsDiv.innerHTML = `
        <i class="fas fa-search fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">Ничего не найдено</h4>
        <p class="text-muted">Попробуйте изменить параметры поиска</p>
        <button class="btn btn-outline-primary" onclick="clearAllFilters()">Сбросить фильтры</button>
      `;
      specialsSection.appendChild(noResultsDiv);
    }
  }

  function clearAllFilters() {
    // Reset all filter inputs
    if (typeFilter) typeFilter.value = '';
    if (districtFilter) districtFilter.value = '';
    if (minPriceFilter) minPriceFilter.value = '';
    if (maxPriceFilter) maxPriceFilter.value = '';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';

    // Clear search button
    const clearSearchBtn = document.querySelector('.clear-search');
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';

    // Reset current filters
    currentFilters = {
      type: '',
      district: '',
      minPrice: 0,
      maxPrice: Infinity,
      search: '',
      sort: 'default'
    };

    // Show all cards
    specialCards.forEach(card => {
      card.style.display = 'block';
      card.style.animation = 'fadeInUp 0.5s ease-out';
    });

    // Update results count
    updateResultsCount(specialCards.length);

    // Remove no results message
    const noResultsMessage = document.querySelector('.no-results-message');
    if (noResultsMessage) {
      noResultsMessage.remove();
    }

    // Add success feedback
    showToast('Фильтры сброшены', 'info');
  }

  // Make clearAllFilters global for onclick handlers
  window.clearAllFilters = clearAllFilters;

  // Add advanced filter features
  addAdvancedFeatures();

  function addAdvancedFeatures() {
    // Add filter presets
    const filterPresets = document.createElement('div');
    filterPresets.className = 'filter-presets mt-3';
    filterPresets.innerHTML = `
      <small class="text-muted d-block mb-2">Быстрые фильтры:</small>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-sm btn-outline-secondary preset-btn" data-preset="budget">Бюджетные</button>
        <button class="btn btn-sm btn-outline-secondary preset-btn" data-preset="premium">Премиум</button>
        <button class="btn btn-sm btn-outline-secondary preset-btn" data-preset="center">Центр</button>
      </div>
    `;

    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
      filterForm.appendChild(filterPresets);

      // Add preset click handlers
      document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const preset = this.getAttribute('data-preset');
          applyPreset(preset);
        });
      });
    }
  }

  function applyPreset(preset) {
    switch (preset) {
      case 'budget':
        if (maxPriceFilter) maxPriceFilter.value = '100000';
        if (minPriceFilter) minPriceFilter.value = '';
        break;
      case 'premium':
        if (minPriceFilter) minPriceFilter.value = '200000';
        if (maxPriceFilter) maxPriceFilter.value = '';
        break;
      case 'center':
        if (districtFilter) districtFilter.value = 'центр';
        break;
    }

    applyFilters(false);
    showToast(`Применен фильтр: ${preset}`, 'info');
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        showToast('Поиск активирован (Ctrl+K)', 'info');
      }
    }

    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      applyFilters(true);
    }
  });

  // Add filter state persistence
  saveFilterState();
  loadFilterState();

  function saveFilterState() {
    const filters = {
      type: typeFilter ? typeFilter.value : '',
      district: districtFilter ? districtFilter.value : '',
      minPrice: minPriceFilter ? minPriceFilter.value : '',
      maxPrice: maxPriceFilter ? maxPriceFilter.value : '',
      search: searchInput ? searchInput.value : '',
      sort: sortSelect ? sortSelect.value : 'default'
    };

    localStorage.setItem('propertyFilters', JSON.stringify(filters));
  }

  function loadFilterState() {
    const savedFilters = localStorage.getItem('propertyFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);

      if (typeFilter && filters.type) typeFilter.value = filters.type;
      if (districtFilter && filters.district) districtFilter.value = filters.district;
      if (minPriceFilter && filters.minPrice) minPriceFilter.value = filters.minPrice;
      if (maxPriceFilter && filters.maxPrice) maxPriceFilter.value = filters.maxPrice;
      if (searchInput && filters.search) searchInput.value = filters.search;
      if (sortSelect && filters.sort) sortSelect.value = filters.sort;

      // Apply saved filters
      setTimeout(() => applyFilters(false), 100);
    }
  }

  // Auto-save filter state
  setInterval(saveFilterState, 5000); // Save every 5 seconds

  // Add export/import filters functionality
  addFilterExportImport();

  function addFilterExportImport() {
    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.className = 'btn btn-sm btn-outline-info mt-2 me-2';
    exportBtn.innerHTML = '<i class="fas fa-share"></i> Экспорт';
    exportBtn.addEventListener('click', exportFilters);

    const importBtn = document.createElement('button');
    importBtn.type = 'button';
    importBtn.className = 'btn btn-sm btn-outline-info mt-2';
    importBtn.innerHTML = '<i class="fas fa-download"></i> Импорт';
    importBtn.addEventListener('click', importFilters);

    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'mt-3';
      buttonContainer.appendChild(exportBtn);
      buttonContainer.appendChild(importBtn);
      filterForm.appendChild(buttonContainer);
    }
  }

  function exportFilters() {
    const filters = {
      type: typeFilter ? typeFilter.value : '',
      district: districtFilter ? districtFilter.value : '',
      minPrice: minPriceFilter ? minPriceFilter.value : '',
      maxPrice: maxPriceFilter ? maxPriceFilter.value : '',
      search: searchInput ? searchInput.value : '',
      sort: sortSelect ? sortSelect.value : 'default'
    };

    const dataStr = JSON.stringify(filters, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'property-filters.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    showToast('Фильтры экспортированы', 'success');
  }

  function importFilters() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const filters = JSON.parse(e.target.result);

            if (typeFilter && filters.type) typeFilter.value = filters.type;
            if (districtFilter && filters.district) districtFilter.value = filters.district;
            if (minPriceFilter && filters.minPrice) minPriceFilter.value = filters.minPrice;
            if (maxPriceFilter && filters.maxPrice) maxPriceFilter.value = filters.maxPrice;
            if (searchInput && filters.search) searchInput.value = filters.search;
            if (sortSelect && filters.sort) sortSelect.value = filters.sort;

            applyFilters(false);
            showToast('Фильтры импортированы', 'success');
          } catch (error) {
            showToast('Ошибка импорта фильтров', 'error');
          }
        };
        reader.readAsText(file);
      }
    });
    input.click();
  }

  // Add filter statistics
  addFilterStatistics();

  function addFilterStatistics() {
    const statsDiv = document.createElement('div');
    statsDiv.className = 'filter-stats mt-3 p-3 bg-light rounded';
    statsDiv.innerHTML = `
      <h6>Статистика поиска</h6>
      <div class="row text-center">
        <div class="col-4">
          <div class="stat-number" id="totalProperties">0</div>
          <small class="text-muted">Всего объектов</small>
        </div>
        <div class="col-4">
          <div class="stat-number" id="visibleProperties">0</div>
          <small class="text-muted">Показывается</small>
        </div>
        <div class="col-4">
          <div class="stat-number" id="avgPrice">0€</div>
          <small class="text-muted">Средняя цена</small>
        </div>
      </div>
    `;

    const filterForm = document.getElementById('filterForm');
    if (filterForm) {
      filterForm.appendChild(statsDiv);
      updateFilterStatistics();
    }
  }

  function updateFilterStatistics() {
    const totalProps = specialCards.length;
    const visibleProps = Array.from(specialCards).filter(card => card.style.display !== 'none').length;

    let totalPrice = 0;
    let priceCount = 0;

    specialCards.forEach(card => {
      if (card.style.display !== 'none') {
        const price = parseInt(card.getAttribute('data-price')) || 0;
        if (price > 0) {
          totalPrice += price;
          priceCount++;
        }
      }
    });

    const avgPrice = priceCount > 0 ? Math.round(totalPrice / priceCount) : 0;

    document.getElementById('totalProperties').textContent = totalProps;
    document.getElementById('visibleProperties').textContent = visibleProps;
    document.getElementById('avgPrice').textContent = avgPrice + '€';
  }

  // Update statistics when filters change
  const originalApplyFilters = applyFilters;
  applyFilters = function(realTime = false) {
    originalApplyFilters.call(this, realTime);
    setTimeout(updateFilterStatistics, 100);
  };
});
