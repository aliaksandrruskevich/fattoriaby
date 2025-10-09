// Данные сотрудников
const teamData = [
    {
        name: "Александр Рускевич",
        position: "Риелтор",
        photo: "https://via.placeholder.com/400x400?text=Александр",
        rating: "4.9",
        reviews: "25",
        experience: "5 лет",
        profile: "https://realt.by/realtors/profile/",
        phone: "+375447025267",
        telegram: "https://t.me/fattoriaminsk",
        viber: "viber://chat?number=%2B375447025267",
        specialization: "Продажа квартир, аренда жилой недвижимости",
        regions: "Минск, Минская область",
        about: "Опытный риелтор с 5-летним стажем. Специализируюсь на продаже и аренде жилой недвижимости в Минске и области. Помогу вам найти идеальный вариант или выгодно продать вашу недвижимость."
    },
    {
        name: "Екатерина Иванова",
        position: "Старший риелтор",
        photo: "https://via.placeholder.com/400x400?text=Екатерина",
        rating: "4.8",
        reviews: "18",
        experience: "7 лет",
        profile: "https://realt.by/realtors/profile/",
        phone: "+375291234567",
        telegram: "https://t.me/example",
        viber: "viber://chat?number=%2B375291234567",
        specialization: "Элитная недвижимость, загородные дома",
        regions: "Минск, Минская область",
        about: "Специалист по элитной недвижимости и загородным домам. Имею опыт работы с клиентами премиум-сегмента. Гарантирую конфиденциальность и индивидуальный подход к каждому клиенту."
    },
    {
        name: "Дмитрий Петров",
        position: "Риелтор-консультант",
        photo: "https://via.placeholder.com/400x400?text=Дмитрий",
        rating: "4.7",
        reviews: "15",
        experience: "4 года",
        profile: "https://realt.by/realtors/profile/",
        phone: "+375337654321",
        telegram: "https://t.me/example",
        viber: "viber://chat?number=%2B375337654321",
        specialization: "Новостройки, ипотечное кредитование",
        regions: "Минск",
        about: "Специализируюсь на новостройках Минска и помощи в получении ипотечного кредитования. Помогу вам подобрать оптимальный вариант квартиры в новостройке и оформить ипотеку на выгодных условиях."
    },
    {
        name: "Ольга Сидорова",
        position: "Риелтор",
        photo: "https://via.placeholder.com/400x400?text=Ольга",
        rating: "4.9",
        reviews: "22",
        experience: "6 лет",
        profile: "https://realt.by/realtors/profile/",
        phone: "+375445556677",
        telegram: "https://t.me/example",
        viber: "viber://chat?number=%2B375445556677",
        specialization: "Вторичное жилье, сопровождение сделок",
        regions: "Минск, Брест",
        about: "Эксперт по вторичному жилью. Обеспечиваю полное юридическое сопровождение сделок. Помогу вам безопасно и выгодно купить или продать квартиру на вторичном рынке."
    }
];

// Функция для загрузки данных сотрудников с логированием и проверками
function loadTeamData() {
    console.log("loadTeamData started");
    const teamGrid = document.getElementById("teamGrid");
    const loadingIndicator = document.getElementById("loadingIndicator");
    
    if (!teamGrid) {
        console.error("Элемент с id 'teamGrid' не найден");
        return;
    }
    
    if (!loadingIndicator) {
        console.warn("Элемент с id 'loadingIndicator' не найден");
    } else {
        loadingIndicator.style.display = "none";
        console.log("loadingIndicator скрыт");
    }
    
    teamGrid.innerHTML = "";
    
    teamData.forEach((member, index) => {
        const memberElement = document.createElement("div");
        memberElement.classList.add("team-member");
        memberElement.setAttribute("data-aos", "fade-up");
        memberElement.setAttribute("data-aos-delay", index * 100);
        
        memberElement.innerHTML = `
            <img src="${member.photo}" class="team-member-img" alt="${member.name}">
            <div class="team-member-info">
                <h3 class="team-member-name">${member.name}</h3>
                <p class="team-member-position">${member.position}</p>
                <div class="team-member-rating">
                    <i class="fas fa-star"></i> ${member.rating} (${member.reviews} отзывов)
                </div>
                <p class="team-member-specialization">${member.specialization}</p>
                <button class="btn btn-outline-primary btn-sm">Подробнее</button>
            </div>
        `;
        
        memberElement.addEventListener('click', () => openMemberModal(member));
        teamGrid.appendChild(memberElement);
    });
    console.log("loadTeamData finished");
}

// Функция для открытия модального окна с информацией о сотруднике с логами
function openMemberModal(member) {
    console.log("openMemberModal called for", member.name);
    const modal = document.getElementById('teamMemberModal');
    if (!modal) {
        console.error("Модальное окно с id 'teamMemberModal' не найдено");
        return;
    }
    
    document.getElementById("modalAgentName").textContent = member.name;
    document.getElementById("modalAgentPosition").textContent = member.position;
    document.getElementById("modalAgentPhoto").src = member.photo;
    document.getElementById("modalAgentExperience").textContent = member.experience;
    document.getElementById("modalAgentRating").textContent = member.rating;
    document.getElementById("modalAgentReviews").textContent = member.reviews;
    document.getElementById("modalAgentAbout").textContent = member.about;
    document.getElementById("modalAgentSpecialization").textContent = member.specialization;
    document.getElementById("modalAgentRegions").textContent = member.regions;
    document.getElementById("modalAgentPhone").textContent = member.phone;
    
    document.getElementById("modalAgentWhatsApp").href = `https://wa.me/${member.phone.replace(/\D/g, '')}`;
    document.getElementById("modalAgentTelegram").href = member.telegram;
    document.getElementById("modalAgentViber").href = member.viber;
    document.getElementById("modalAgentProfile").href = member.profile;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    console.log("Модальное окно открыто для", member.name);
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired");
    loadTeamData();
});
