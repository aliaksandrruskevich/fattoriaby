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
