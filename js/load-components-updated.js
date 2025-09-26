// Динамическая подгрузка навигации и других компонентов

document.addEventListener('DOMContentLoaded', () => {
  // Подгрузка навигации из includes/header.html
  fetch('includes/header.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка загрузки навигации');
      }
      return response.text();
    })
    .then(html => {
      // Вставляем навигацию в элемент с id="header-placeholder"
      const headerPlaceholder = document.getElementById('header-placeholder');
      if (headerPlaceholder) {
        headerPlaceholder.innerHTML = html;
        // Инициализируем обработчики форм после загрузки хедера
        // Формы уже инициализированы в forms.js
      }
    })
    .catch(error => {
      console.error('Ошибка при загрузке навигации:', error);
    });

  // Подгрузка футера из includes/footer.html
  fetch('includes/footer.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('Ошибка загрузки футера');
      }
      return response.text();
    })
    .then(html => {
      // Вставляем футер в элемент с id="footer-placeholder"
      const footerPlaceholder = document.getElementById('footer-placeholder');
      if (footerPlaceholder) {
        footerPlaceholder.innerHTML = html;
        // Инициализируем AOS после загрузки футера
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 1000, once: true });
        }
        // Инициализируем обработчики форм после загрузки футера
        // Формы уже инициализированы в forms.js
        // Инициализируем обработчики модальных окон
        initializeModalHandlers();
      }
    })
    .catch(error => {
      console.error('Ошибка при загрузке футера:', error);
    });
});

// Функция для инициализации обработчиков модальных окон
function initializeModalHandlers() {
    // Добавляем обработчики событий для ссылок в футере после его загрузки
    const privacyLink = document.querySelector('a[onclick="showPrivacyModal()"]');
    const termsLink = document.querySelector('a[onclick="showTermsModal()"]');

    if (privacyLink) {
        privacyLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPrivacyModal();
        });
    }

    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showTermsModal();
        });
    }
}

// Глобальные функции для модальных окон политики конфиденциальности и пользовательского соглашения
function showPrivacyModal() {
    // Создаем модальное окно политики конфиденциальности
    const modalHtml = `
        <div class="modal fade" id="privacyModal" tabindex="-1" aria-labelledby="privacyModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="privacyModalLabel">Политика конфиденциальности</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>1. Общие положения</h6>
                        <p>Настоящая политика конфиденциальности определяет порядок обработки и защиты информации о физических и юридических лицах, использующих сервисы агентства недвижимости "АН ФАТТОРИЯ".</p>

                        <h6>2. Сбор информации</h6>
                        <p>Мы собираем следующие виды информации:</p>
                        <ul>
                            <li>Личную информацию (имя, телефон, email), предоставляемую пользователями при заполнении форм</li>
                            <li>Техническую информацию (IP-адрес, тип браузера, время посещения)</li>
                            <li>Информацию о предпочтениях пользователей при поиске недвижимости</li>
                        </ul>

                        <h6>3. Использование информации</h6>
                        <p>Собираемая информация используется для:</p>
                        <ul>
                            <li>Предоставления консультаций по недвижимости</li>
                            <li>Отправки информационных материалов и предложений</li>
                            <li>Улучшения качества обслуживания</li>
                            <li>Анализа посещаемости сайта</li>
                        </ul>

                        <h6>4. Защита информации</h6>
                        <p>Мы принимаем все необходимые меры для защиты вашей информации от несанкционированного доступа, изменения, раскрытия или уничтожения.</p>

                        <h6>5. Ваши права</h6>
                        <p>Вы имеете право:</p>
                        <ul>
                            <li>Получать информацию о обработке ваших данных</li>
                            <li>Требовать исправления неточных данных</li>
                            <li>Требовать удаления ваших данных</li>
                            <li>Отозвать согласие на обработку данных</li>
                        </ul>

                        <h6>6. Контактная информация</h6>
                        <p>По вопросам обработки данных обращайтесь:</p>
                        <ul>
                            <li>Телефон: +375 (44) 702-52-67</li>
                            <li>Email: ruskevichegor@gmail.com</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Добавляем модальное окно в DOM, если оно еще не существует
    if (!document.getElementById('privacyModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Показываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('privacyModal'));
    modal.show();
}

function showTermsModal() {
    // Создаем модальное окно пользовательского соглашения
    const modalHtml = `
        <div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="termsModalLabel">Пользовательское соглашение</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <h6>1. Общие положения</h6>
                        <p>Настоящее пользовательское соглашение регулирует отношения между агентством недвижимости "АН ФАТТОРИЯ" и пользователями сайта.</p>

                        <h6>2. Предмет соглашения</h6>
                        <p>Агентство предоставляет пользователям доступ к информационным материалам о недвижимости и услугам по подбору объектов.</p>

                        <h6>3. Права и обязанности сторон</h6>
                        <p><strong>Пользователь имеет право:</strong></p>
                        <ul>
                            <li>Получать информацию о доступных объектах недвижимости</li>
                            <li>Пользоваться формами обратной связи</li>
                            <li>Подписываться на информационные рассылки</li>
                        </ul>

                        <p><strong>Пользователь обязуется:</strong></p>
                        <ul>
                            <li>Предоставлять достоверную информацию</li>
                            <li>Не нарушать законодательство Республики Беларусь</li>
                            <li>Уважать права третьих лиц</li>
                        </ul>

                        <h6>4. Ответственность</h6>
                        <p>Агентство не несет ответственности за неточности в информации, предоставленной третьими лицами, а также за технические сбои в работе сайта.</p>

                        <h6>5. Изменение условий</h6>
                        <p>Агентство оставляет за собой право вносить изменения в настоящее соглашение без предварительного уведомления пользователей.</p>

                        <h6>6. Контактная информация</h6>
                        <p>По вопросам использования сайта обращайтесь:</p>
                        <ul>
                            <li>Телефон: +375 (44) 702-52-67</li>
                            <li>Email: ruskevichegor@gmail.com</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Добавляем модальное окно в DOM, если оно еще не существует
    if (!document.getElementById('termsModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Показываем модальное окно
    const modal = new bootstrap.Modal(document.getElementById('termsModal'));
    modal.show();
}
