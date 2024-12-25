//--------------------------------------------------
// Глобальные переменные и функции до DOMContentLoaded
//--------------------------------------------------

// 1) Темный режим
const darkModeToggle = document.getElementById('dark-mode');
const body = document.body;

darkModeToggle.addEventListener('change', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem(
    'darkMode',
    body.classList.contains('dark-mode') ? 'enabled' : 'disabled'
  );
});

// 2) Fade-in элементы
const fadeInElements = document.querySelectorAll('.fade-in-start');

// 3) Галерея (открытие на полный экран)
const galleryImagesArray = Array.from(document.querySelectorAll('.gallery-image'));
let currentImageIndex = 0;

const openFullscreenGallery = (index) => {
  currentImageIndex = index;

  const fullScreenOverlay = document.createElement('div');
  fullScreenOverlay.classList.add('fullscreen-overlay');
  fullScreenOverlay.innerHTML = `
    <div class="fullscreen-content">
      <img src="${galleryImagesArray[index].src}" alt="${galleryImagesArray[index].alt}">
    </div>`;
  document.body.appendChild(fullScreenOverlay);

  // Закрытие по клику на фон
  fullScreenOverlay.addEventListener('click', (e) => {
    if (!e.target.closest('.fullscreen-content')) {
      fullScreenOverlay.remove();
    }
  });

  // Перелистывание по клику на изображение
  const imageElement = fullScreenOverlay.querySelector('img');
  imageElement.addEventListener('click', (e) => {
    const clickX = e.clientX - imageElement.getBoundingClientRect().left;
    const imageWidth = imageElement.offsetWidth;

    // Если клик левой половине — назад, иначе — вперёд
    if (clickX < imageWidth / 2) {
      currentImageIndex = (currentImageIndex - 1 + galleryImagesArray.length) % galleryImagesArray.length;
    } else {
      currentImageIndex = (currentImageIndex + 1) % galleryImagesArray.length;
    }
    updateFullscreenImage(fullScreenOverlay);
  });
};

const updateFullscreenImage = (overlay) => {
  const imgElement = overlay.querySelector('img');
  imgElement.src = galleryImagesArray[currentImageIndex].src;
  imgElement.alt = galleryImagesArray[currentImageIndex].alt;
};

// Назначаем обработчики клика на каждое изображение в галерее
galleryImagesArray.forEach((image, index) => {
  image.addEventListener('click', () => openFullscreenGallery(index));
});

// 4) Погода
const weatherInfo = document.getElementById('weather-info');

const fetchWeather = async () => {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=43.165&longitude=44.817&current_weather=true');
    const data = await response.json();
    const { temperature, weathercode } = data.current_weather;

    const weatherIcons = {
      1: '☀️',  // Солнечно
      2: '🌤️', // Переменная облачность
      3: '☁️',  // Облачно
      45: '🌫️', // Туман
      51: '🌦️', // Лёгкий дождь
      61: '🌧️', // Дождь
    };

    const weatherIcon = weatherIcons[weathercode] || '❓';

    weatherInfo.innerHTML = `
      <p>Температура: ${temperature}°C</p>
      <p>Погода: ${weatherIcon}</p>
    `;
  } catch (error) {
    weatherInfo.innerHTML = '<p>Не удалось загрузить данные о погоде.</p>';
  }
};

// 5) Перевод (translations)
const langButtons = document.querySelectorAll('.lang-btn'); // Кнопки переключения языка
const elementsToTranslate = document.querySelectorAll('[data-lang-key]');

const translations = {
  en: {
    title: "Ingushetia Republic",
    news: "News",
    ads: "Advertisements",
    gallery: "Gallery",
    faq: "FAQ",
    contact: "Contact",
    weather: "Weather Forecast",
    temp: "Temperature",
    condition: "Condition",
    "history-title": "History of Ingushetia",
    "history-description": "Ingushetia is one of the oldest regions of the North Caucasus, rich in cultural and historical heritage.",
    "history-fact1": "The towers of Ingushetia are unique architectural monuments built in the Middle Ages.",
    "history-fact2": "The Ingush people are famous for their traditions of hospitality and respect.",
    "history-fact3": "Always. Everywhere. Ingush people."
  },
  ru: {
    title: "Республика Ингушетия",
    news: "Новости",
    ads: "Объявления",
    gallery: "Галерея",
    faq: "FAQ",
    contact: "Контакты",
    weather: "Прогноз погоды",
    temp: "Температура",
    condition: "Погода",
    "history-title": "История Ингушетии",
    "history-description": "Ингушетия – один из древнейших регионов Северного Кавказа, богатый культурным и историческим наследием.",
    "history-fact1": "Башни Ингушетии — уникальные памятники архитектуры, построенные в Средние века.",
    "history-fact2": "Ингушский народ славится своими традициями гостеприимства и уважения.",
    "history-fact3": "Всегда. Везде. Ингуши."
  }
};

const translatePage = (lang) => {
  elementsToTranslate.forEach((element) => {
    const key = element.getAttribute('data-lang-key');
    element.textContent = translations[lang][key];
  });
};

//--------------------------------------------------
// ОДИН общий обработчик DOMContentLoaded
//--------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Проверка сохранённого режима darkMode
  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.checked = true;
  }

  // 2. Запускаем анимацию fadeIn после задержки
  setTimeout(() => {
    fadeInElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 500);

  // 3. Инициируем язык (читаем из localStorage)
  const savedLang = localStorage.getItem('selectedLang') || 'ru';
  translatePage(savedLang);

  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      localStorage.setItem('selectedLang', selectedLang);
      translatePage(selectedLang);
    });
  });

  // 4. Инициируем погоду и AOS
  fetchWeather();
  AOS.init({
    duration: 800,
    once: true
  });

  // 5. Кнопка "Наверх"
  const scrollTopBtn = document.getElementById('scroll-to-top');
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollTopBtn.style.display = 'block';
      scrollTopBtn.style.opacity = '1';
    } else {
      scrollTopBtn.style.opacity = '0';
      setTimeout(() => {
        if (window.pageYOffset <= 300) {
          scrollTopBtn.style.display = 'none';
        }
      }, 300);
    }
  });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 6. Фильтрация галереи
  const filterButtons = document.querySelectorAll('.gallery-filters button');
  const galleryImages = document.querySelectorAll('.gallery-image');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      galleryImages.forEach(img => {
        if (filter === 'all' || img.getAttribute('data-category') === filter) {
          img.style.display = '';
        } else {
          img.style.display = 'none';
        }
      });
    });
  });

  // 7. Гамбургер-меню
  const menuToggle = document.querySelector('.menu-toggle');
  const menuContainer = document.querySelector('.menu-container');
  menuToggle.addEventListener('click', () => {
    menuContainer.classList.toggle('open');
  });
});
