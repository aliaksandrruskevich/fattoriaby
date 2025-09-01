// Функции для показа модальных окон политики конфиденциальности и пользовательского соглашения
function showPrivacyModal() {
  const modal = new bootstrap.Modal(document.getElementById('privacyModal'));
  modal.show();
}

function showTermsModal() {
  const modal = new bootstrap.Modal(document.getElementById('termsModal'));
  modal.show();
}

// Функция для обработки пагинации (улучшенная версия)
function handlePagination(page) {
  // В реальном приложении здесь была бы логика загрузки контента для выбранной страницы
  console.log('Переход на страницу:', page);

  // Определяем общее количество страниц динамически
  const pageNumbers = document.querySelectorAll('#blogPagination .page-number');
  const totalPages = pageNumbers.length;

  // Обновляем активную страницу в пагинации
  const pageLinks = document.querySelectorAll('#blogPagination .page-link');
  pageLinks.forEach(link => {
    link.parentElement.classList.remove('active');
  });

  // Находим и активируем выбранную страницу
  const activePage = document.querySelector(`#blogPagination .page-link[data-page="${page}"]`);
  if (activePage) {
    activePage.parentElement.classList.add('active');
  }

  // Управляем состоянием кнопок "Предыдущая" и "Следующая"
  const prevBtn = document.querySelector('#blogPagination .prev-page');
  const nextBtn = document.querySelector('#blogPagination .next-page');

  if (prevBtn) {
    if (page === 1) {
      prevBtn.parentElement.classList.add('disabled');
    } else {
      prevBtn.parentElement.classList.remove('disabled');
    }
  }

  if (nextBtn) {
    if (page === totalPages) {
      nextBtn.parentElement.classList.add('disabled');
    } else {
      nextBtn.parentElement.classList.remove('disabled');
    }
  }

  // Показываем уведомление (в реальном приложении здесь была бы загрузка контента)
  showToast('Загрузка страницы ' + page + ' из ' + totalPages + '...', 'info');
}

// Добавляем обработчики событий для пагинации
document.addEventListener('DOMContentLoaded', function() {
  const pagination = document.getElementById('blogPagination');

  if (pagination) {
    // Обработчик для цифровых страниц
    const pageNumbers = pagination.querySelectorAll('.page-number');
    pageNumbers.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const pageNumber = parseInt(this.getAttribute('data-page'));
        handlePagination(pageNumber);
      });
    });

    // Обработчик для кнопки "Предыдущая"
    const prevBtn = pagination.querySelector('.prev-page');
    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const activePage = pagination.querySelector('.page-item.active .page-number');
        if (activePage) {
          const currentPage = parseInt(activePage.getAttribute('data-page'));
          if (currentPage > 1) {
            handlePagination(currentPage - 1);
          }
        }
      });
    }

    // Обработчик для кнопки "Следующая"
    const nextBtn = pagination.querySelector('.next-page');
    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const activePage = pagination.querySelector('.page-item.active .page-number');
        if (activePage) {
          const currentPage = parseInt(activePage.getAttribute('data-page'));
          if (currentPage < pageNumbers.length) {
            handlePagination(currentPage + 1);
          }
        }
      });
    }
  }
});
