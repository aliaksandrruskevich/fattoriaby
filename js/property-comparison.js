document.addEventListener('DOMContentLoaded', function () {
  // Property comparison functionality
  let selectedProperties = [];
  const maxComparisons = 4;

  // Initialize comparison features
  initializeComparison();

  function initializeComparison() {
    // Add comparison checkboxes to property cards
    addComparisonCheckboxes();

    // Create comparison modal
    createComparisonModal();

    // Add comparison button to header or floating
    addComparisonButton();

    // Load saved comparisons from localStorage
    loadSavedComparisons();
  }

  function addComparisonCheckboxes() {
    const propertyCards = document.querySelectorAll('#specials .special-card, .property-card');

    propertyCards.forEach((card, index) => {
      // Skip if checkbox already exists
      if (card.querySelector('.comparison-checkbox')) return;

      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'comparison-checkbox-container';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'comparison-checkbox';
      checkbox.id = `compare-${index}`;

      const label = document.createElement('label');
      label.htmlFor = `compare-${index}`;
      label.className = 'comparison-label';
      label.innerHTML = '<i class="fas fa-balance-scale"></i>';

      // Get property data
      const propertyData = extractPropertyData(card);

      checkbox.addEventListener('change', function() {
        if (this.checked) {
          addToComparison(propertyData);
        } else {
          removeFromComparison(propertyData.id);
        }
        updateComparisonUI();
      });

      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);

      // Position the checkbox (top-right corner)
      checkboxContainer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
      `;

      // Make card position relative if not already
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }

      card.appendChild(checkboxContainer);

      // Add hover effect to show checkbox
      card.addEventListener('mouseenter', function() {
        checkboxContainer.style.transform = 'scale(1.1)';
      });

      card.addEventListener('mouseleave', function() {
        checkboxContainer.style.transform = 'scale(1)';
      });
    });
  }

  function extractPropertyData(card) {
    const title = card.querySelector('h5')?.textContent || 'Без названия';
    const price = card.querySelector('.text-warning')?.textContent || 'Цена не указана';
    const description = card.querySelector('p')?.textContent || 'Описание отсутствует';
    const image = card.querySelector('img')?.src || '';
    const type = card.getAttribute('data-type') || 'Не указан';
    const district = card.getAttribute('data-district') || 'Не указан';

    return {
      id: generatePropertyId(card),
      title,
      price,
      description,
      image,
      type,
      district
    };
  }

  function generatePropertyId(card) {
    // Generate unique ID based on card content
    const title = card.querySelector('h5')?.textContent || '';
    const price = card.querySelector('.text-warning')?.textContent || '';
    return btoa(title + price).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
  }

  function addToComparison(property) {
    if (selectedProperties.length >= maxComparisons) {
      showToast(`Максимум ${maxComparisons} объекта для сравнения`, 'warning');
      return;
    }

    if (!selectedProperties.find(p => p.id === property.id)) {
      selectedProperties.push(property);
      showToast(`Добавлено к сравнению: ${property.title}`, 'success');
      saveComparisons();
    }
  }

  function removeFromComparison(propertyId) {
    const index = selectedProperties.findIndex(p => p.id === propertyId);
    if (index > -1) {
      const removed = selectedProperties.splice(index, 1)[0];
      showToast(`Удалено из сравнения: ${removed.title}`, 'info');

      // Uncheck the corresponding checkbox
      const checkbox = document.querySelector(`#compare-${Array.from(document.querySelectorAll('.special-card, .property-card')).findIndex(card => generatePropertyId(card) === propertyId)}`);
      if (checkbox) checkbox.checked = false;

      updateComparisonUI();
      saveComparisons();
    }
  }

  function updateComparisonUI() {
    // Update comparison button badge
    const badge = document.querySelector('.comparison-badge');
    if (badge) {
      badge.textContent = selectedProperties.length;
      badge.style.display = selectedProperties.length > 0 ? 'block' : 'none';
    }

    // Update checkboxes state
    document.querySelectorAll('.comparison-checkbox').forEach((checkbox, index) => {
      const card = checkbox.closest('.special-card, .property-card');
      const propertyId = generatePropertyId(card);
      checkbox.checked = selectedProperties.some(p => p.id === propertyId);
    });
  }

  function createComparisonModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'comparisonModal';
    modal.setAttribute('tabindex', '-1');

    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-balance-scale me-2"></i>
              Сравнение объектов недвижимости
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div id="comparisonContent">
              <div class="text-center py-5">
                <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">Выберите объекты для сравнения</h4>
                <p class="text-muted">Отметьте галочками объекты на странице и нажмите "Сравнить"</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
            <button type="button" class="btn btn-primary" id="clearComparisonBtn">
              <i class="fas fa-trash me-1"></i>
              Очистить сравнение
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add clear comparison functionality
    document.getElementById('clearComparisonBtn').addEventListener('click', function() {
      selectedProperties = [];
      updateComparisonUI();
      saveComparisons();
      renderComparisonTable();
      showToast('Сравнение очищено', 'info');
    });
  }

  function renderComparisonTable() {
    const content = document.getElementById('comparisonContent');

    if (selectedProperties.length === 0) {
      content.innerHTML = `
        <div class="text-center py-5">
          <i class="fas fa-balance-scale fa-3x text-muted mb-3"></i>
          <h4 class="text-muted">Выберите объекты для сравнения</h4>
          <p class="text-muted">Отметьте галочками объекты на странице и нажмите "Сравнить"</p>
        </div>
      `;
      return;
    }

    let tableHtml = `
      <div class="table-responsive">
        <table class="table table-bordered comparison-table">
          <thead class="table-dark">
            <tr>
              <th>Характеристика</th>
              ${selectedProperties.map((prop, index) => `
                <th class="property-column">
                  <div class="d-flex align-items-center justify-content-between">
                    <span>Объект ${index + 1}</span>
                    <button class="btn btn-sm btn-outline-danger remove-property" data-property-id="${prop.id}">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Изображение</strong></td>
              ${selectedProperties.map(prop => `
                <td class="text-center">
                  <img src="${prop.image || '/фото/placeholder.jpg'}" alt="${prop.title}" class="comparison-image" style="width: 100px; height: 75px; object-fit: cover; border-radius: 5px;">
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>Название</strong></td>
              ${selectedProperties.map(prop => `<td><strong>${prop.title}</strong></td>`).join('')}
            </tr>
            <tr>
              <td><strong>Цена</strong></td>
              ${selectedProperties.map(prop => `<td class="text-success fw-bold">${prop.price}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Тип</strong></td>
              ${selectedProperties.map(prop => `<td>${prop.type}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Район</strong></td>
              ${selectedProperties.map(prop => `<td>${prop.district}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Описание</strong></td>
              ${selectedProperties.map(prop => `<td><small>${prop.description}</small></td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>

      <div class="comparison-actions mt-4 text-center">
        <button class="btn btn-success me-2" onclick="window.print()">
          <i class="fas fa-print me-1"></i>
          Распечатать сравнение
        </button>
        <button class="btn btn-info" onclick="exportComparison()">
          <i class="fas fa-download me-1"></i>
          Экспорт в PDF
        </button>
      </div>
    `;

    content.innerHTML = tableHtml;

    // Add remove button functionality
    document.querySelectorAll('.remove-property').forEach(btn => {
      btn.addEventListener('click', function() {
        const propertyId = this.getAttribute('data-property-id');
        removeFromComparison(propertyId);
        renderComparisonTable();
      });
    });
  }

  function addComparisonButton() {
    const button = document.createElement('div');
    button.className = 'comparison-floating-btn';
    button.innerHTML = `
      <button class="btn btn-primary rounded-pill shadow-lg" id="compareBtn" data-bs-toggle="modal" data-bs-target="#comparisonModal">
        <i class="fas fa-balance-scale me-2"></i>
        Сравнить
        <span class="badge bg-light text-dark ms-2 comparison-badge" id="comparisonBadge" style="display: none;">0</span>
      </button>
    `;

    button.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 1000;
      display: none;
    `;

    document.body.appendChild(button);

    // Show/hide button based on selections
    const compareBtn = document.getElementById('compareBtn');
    compareBtn.addEventListener('click', function() {
      renderComparisonTable();
    });
  }

  function saveComparisons() {
    localStorage.setItem('selectedProperties', JSON.stringify(selectedProperties));
  }

  function loadSavedComparisons() {
    const saved = localStorage.getItem('selectedProperties');
    if (saved) {
      try {
        selectedProperties = JSON.parse(saved);
        updateComparisonUI();

        // Show floating button if there are saved comparisons
        if (selectedProperties.length > 0) {
          document.querySelector('.comparison-floating-btn').style.display = 'block';
        }
      } catch (e) {
        console.error('Error loading saved comparisons:', e);
      }
    }
  }

  // Global functions for external access
  window.addToComparison = addToComparison;
  window.removeFromComparison = removeFromComparison;
  window.exportComparison = function() {
    // Simple export functionality
    const data = selectedProperties.map(prop => ({
      title: prop.title,
      price: prop.price,
      type: prop.type,
      district: prop.district,
      description: prop.description
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-comparison.json';
    a.click();
    URL.revokeObjectURL(url);

    showToast('Сравнение экспортировано', 'success');
  };

  // Show floating button when properties are selected
  function updateComparisonUI() {
    const floatingBtn = document.querySelector('.comparison-floating-btn');
    const badge = document.getElementById('comparisonBadge');

    if (selectedProperties.length > 0) {
      if (floatingBtn) floatingBtn.style.display = 'block';
      if (badge) {
        badge.textContent = selectedProperties.length;
        badge.style.display = 'inline-block';
      }
    } else {
      if (floatingBtn) floatingBtn.style.display = 'none';
    }

    // Update checkboxes
    document.querySelectorAll('.comparison-checkbox').forEach((checkbox, index) => {
      const card = checkbox.closest('.special-card, .property-card');
      if (card) {
        const propertyId = generatePropertyId(card);
        checkbox.checked = selectedProperties.some(p => p.id === propertyId);
      }
    });
  }

  // Add CSS styles for comparison features
  addComparisonStyles();

  function addComparisonStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .comparison-checkbox-container {
        transition: all 0.3s ease;
      }

      .comparison-checkbox {
        display: none;
      }

      .comparison-label {
        cursor: pointer;
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        transition: all 0.3s ease;
      }

      .comparison-checkbox:checked + .comparison-label {
        background: var(--primary-color);
        color: white;
      }

      .comparison-floating-btn .btn {
        animation: pulse 2s infinite;
      }

      .comparison-table th.property-column {
        min-width: 200px;
        vertical-align: top;
      }

      .comparison-image {
        transition: transform 0.3s ease;
      }

      .comparison-image:hover {
        transform: scale(1.1);
      }

      .remove-property {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }

      @media (max-width: 768px) {
        .comparison-floating-btn {
          bottom: 80px;
          right: 15px;
        }

        .comparison-table {
          font-size: 0.875rem;
        }

        .comparison-table th.property-column {
          min-width: 150px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize comparison UI
  updateComparisonUI();
});
