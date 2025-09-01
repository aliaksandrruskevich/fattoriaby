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
