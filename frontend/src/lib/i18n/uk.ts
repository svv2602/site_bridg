/**
 * Ukrainian translations for Bridgestone Ukraine website
 * This file prepares the codebase for future internationalization
 */

export const uk = {
  common: {
    home: "Головна",
    search: "Пошук",
    findDealer: "Знайти дилера",
    readMore: "Детальніше",
    contact: "Зв'язатися",
    phone: "Зателефонувати",
    viewAll: "Переглянути всі",
    learnMore: "Дізнатися більше",
    back: "Назад",
    next: "Далі",
    previous: "Попередня",
    loading: "Завантаження...",
    close: "Закрити",
    open: "Відкрити",
    menu: "Меню",
  },
  seasons: {
    summer: "Літні шини",
    winter: "Зимові шини",
    allseason: "Всесезонні шини",
    summerShort: "Літня",
    winterShort: "Зимова",
    allseasonShort: "Всесезонна",
  },
  vehicleTypes: {
    passenger: "Легкові авто",
    suv: "SUV / 4x4",
    lcv: "Легкі вантажні",
    sport: "Спортивні",
  },
  search: {
    bySize: "За розміром",
    byCar: "За авто",
    width: "Ширина",
    aspectRatio: "Висота профілю",
    diameter: "Діаметр",
    selectWidth: "Оберіть ширину",
    selectAspectRatio: "Оберіть профіль",
    selectDiameter: "Оберіть діаметр",
    findTyres: "Знайти шини",
    selectMake: "Оберіть марку",
    selectModel: "Оберіть модель",
    selectYear: "Оберіть рік",
    results: "Результати пошуку",
    noResults: "Нічого не знайдено",
  },
  catalog: {
    passengerTyres: "Шини для легкових авто",
    suvTyres: "Шини для SUV та 4x4",
    lcvTyres: "Шини для комерційних авто",
    models: "моделей",
    chooseSeason: "Оберіть сезонність",
    popularModels: "Популярні моделі",
    availableSizes: "Доступні розміри",
  },
  tyre: {
    season: "Сезонність",
    vehicleType: "Тип авто",
    technologies: "Технології",
    euLabel: "EU-маркування",
    wetGrip: "Зчеплення на мокрій дорозі",
    fuelEfficiency: "Економія пального",
    noiseLevel: "Рівень шуму",
    specifications: "Технічні характеристики",
    sizeFormat: "Типорозмір",
    loadIndex: "Індекс навантаження",
    speedIndex: "Індекс швидкості",
  },
  comparison: {
    title: "Порівняння шин",
    selectTyres: "Оберіть шини для порівняння",
    compare: "Порівняти",
    selected: "Обрано",
    maxTyres: "Максимум 3 шини",
    characteristic: "Характеристика",
    betterValue: "Краще значення",
  },
  dealers: {
    title: "Де купити",
    findNearby: "Знайти найближчий",
    searchByCity: "Пошук за містом",
    allDealers: "Всі дилери",
    authorizedDealer: "Авторизований дилер",
    serviceCenter: "Сервісний центр",
    openNow: "Зараз відкрито",
    workingHours: "Графік роботи",
    address: "Адреса",
    phone: "Телефон",
    getDirections: "Прокласти маршрут",
  },
  contacts: {
    title: "Контакти",
    hotline: "Гаряча лінія",
    email: "Електронна пошта",
    office: "Офіційне представництво",
    workingHours: "Графік роботи",
    contactForm: "Форма зворотного зв'язку",
    yourName: "Ваше ім'я",
    yourEmail: "Ваш email",
    yourPhone: "Ваш телефон",
    message: "Повідомлення",
    send: "Надіслати",
    sending: "Надсилання...",
    successMessage: "Дякуємо! Ваше повідомлення надіслано.",
    errorMessage: "Помилка відправки. Спробуйте ще раз.",
  },
  about: {
    title: "Про Bridgestone",
    history: "Історія компанії",
    values: "Наші цінності",
    innovations: "Інновації",
    sustainability: "Сталий розвиток",
  },
  advice: {
    title: "Корисна інформація",
    articles: "Статті",
    tips: "Поради",
    categories: "Категорії",
    readTime: "хв читання",
    publishedAt: "Опубліковано",
    relatedArticles: "Читайте також",
  },
  technology: {
    title: "Технології Bridgestone",
    keyBenefits: "Ключові переваги",
    usedIn: "Використовується в",
    models: "моделях",
  },
  errors: {
    notFound: "Сторінку не знайдено",
    somethingWentWrong: "Щось пішло не так",
    tryAgain: "Спробувати знову",
    goHome: "На головну",
    pageNotExists: "Схоже, такої сторінки не існує",
    loadingError: "Помилка завантаження даних",
  },
  footer: {
    privacyPolicy: "Політика конфіденційності",
    termsOfUse: "Умови використання",
    sitemap: "Карта сайту",
    returns: "Повернення та гарантія",
    copyright: "Всі права захищені",
    demoNotice: "Цей сайт є демонстраційним макетом",
  },
  cta: {
    needHelp: "Потрібна допомога у виборі?",
    getConsultation: "Отримати консультацію",
    findDealer: "Знайти дилера",
    selectTyres: "Підібрати шини",
    viewCatalog: "Переглянути каталог",
  },
} as const;

export type Translations = typeof uk;
export type TranslationKey = keyof typeof uk;

/**
 * Helper function to get translation by dot-notation key
 * @example t('common.home') // "Головна"
 * @example t('seasons.summer') // "Літні шини"
 */
export function t(key: string): string {
  const keys = key.split(".");
  let value: unknown = uk;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key; // Return key if not found
    }
  }

  return typeof value === "string" ? value : key;
}

/**
 * Get all translations for a section
 * @example getSection('seasons') // { summer: "...", winter: "...", ... }
 */
export function getSection<K extends TranslationKey>(
  section: K
): (typeof uk)[K] {
  return uk[section];
}
