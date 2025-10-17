document.addEventListener('DOMContentLoaded', function() {
  const propertiesContainer = document.getElementById('propertiesContainer');
  const filterForm = document.querySelector('.filter-section .row');
  const applyFiltersBtn = document.querySelector('.filter-section .btn-primary');
  const viewOptions = document.querySelector('.view-options');
  const gridView = document.getElementById('gridView');
  const listView = document.getElementById('listView');

  let currentPage = 1;
  let currentFilters = {};
  let currentView = 'grid'; // 'grid' or 'list'

  // Initialize
  loadProperties();

  // Event listeners
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyFilters);
  }

  if (gridView) {
    gridView.addEventListener('click', () => setView('grid'));
  }

  if (listView) {
    listView.addEventListener('click', () => setView('list'));
  }

  // Load more on scroll (optional)
  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
      loadMoreProperties();
    }
  });

  function loadProperties(page = 1, filters = {}) {
    const limit = 12;
    const offset = (page - 1) * limit;

    let url = `/api/properties.php?limit=${limit}&offset=${offset}`;
    if (filters.operation) url += `&operation=${filters.operation}`;
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.rooms) url += `&rooms=${filters.rooms}`;
    if (filters.price_min) url += `&price_min=${filters.price_min}`;
    if (filters.price_max) url += `&price_max=${filters.price_max}`;
    if (filters.sort) url += `&sort=${filters.sort}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (page === 1) {
          propertiesContainer.innerHTML = '';
        }
        displayProperties(data, currentView);
        currentPage = page;
      })
      .catch(error => {
        console.error('Error loading properties:', error);
        propertiesContainer.innerHTML = '<div class="alert alert-danger">Ошибка загрузки объектов</div>';
      });
  }

  function loadMoreProperties() {
    currentPage++;
    loadProperties(currentPage, currentFilters);
  }

  function applyFilters() {
    // Get filter values
    const typeSelect = document.querySelector('.filter-group select[label="Тип недвижимости"]') || document.querySelector('select');
    const districtInput = document.querySelector('.filter-group input[placeholder="Район"]');
    const roomsSelect = document.querySelector('.filter-group select[label="Количество комнат"]');
    const priceMinInput = document.querySelector('.filter-group input[placeholder="от"]');
    const priceMaxInput = document.querySelector('.filter-group input[placeholder="до"]');
    const areaMinInput = document.querySelector('.filter-group input[placeholder="от"]:nth-of-type(2)');
    const areaMaxInput = document.querySelector('.filter-group input[placeholder="до"]:nth-of-type(2)');

    currentFilters = {
      type: typeSelect ? typeSelect.value : '',
      district: districtInput ? districtInput.value : '',
      rooms: roomsSelect ? roomsSelect.value : '',
      price_min: priceMinInput ? priceMinInput.value : '',
      price_max: priceMaxInput ? priceMaxInput.value : '',
      area_min: areaMinInput ? areaMinInput.value : '',
      area_max: areaMaxInput ? areaMaxInput.value : ''
    };

    loadProperties(1, currentFilters);
  }

  function displayProperties(properties, view = 'grid') {
    properties.forEach(property => {
      const propertyCard = createPropertyCard(property, view);
      propertiesContainer.appendChild(propertyCard);
    });
  }

  function createPropertyCard(property, view = 'grid') {
    const col = document.createElement('div');
    col.className = view === 'grid' ? 'col-md-4 col-sm-6 mb-4' : 'col-12 mb-4';

    const card = document.createElement('div');
    card.className = 'card property-card h-100';

    const img = document.createElement('img');
    img.className = 'card-img-top';
    img.src = property.photos && property.photos.length > 0 ? property.photos[0] : 'https://via.placeholder.com/300x200?text=Нет+фото';
    img.alt = property.title;
    img.loading = 'lazy';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = property.title;

    const location = document.createElement('p');
    location.className = 'card-text text-muted';
    location.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${property.location}`;

    const price = document.createElement('p');
    price.className = 'card-text fw-bold text-warning';
    price.textContent = formatPrice(property.price, property.currency);

    const features = document.createElement('p');
    features.className = 'card-text small';
    features.textContent = property.features ? property.features.slice(0, 2).join(', ') : '';

    const link = document.createElement('a');
    link.href = `/object/${property.unid}`;
    link.className = 'btn btn-warning mt-auto';
    link.textContent = 'Подробнее';

    cardBody.appendChild(title);
    cardBody.appendChild(location);
    cardBody.appendChild(price);
    cardBody.appendChild(features);
    cardBody.appendChild(link);

    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
  }

  function formatPrice(price, currency = 'USD') {
    if (!price) return 'Цена по запросу';
    const symbols = { 'USD': '$', 'EUR': '€', 'BYN': 'руб', 'RUB': 'р' };
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + (symbols[currency] || currency);
  }

  function setView(view) {
    currentView = view;
    gridView.classList.toggle('active', view === 'grid');
    listView.classList.toggle('active', view === 'list');
    // Re-render current properties with new view
    loadProperties(1, currentFilters);
  }
});
