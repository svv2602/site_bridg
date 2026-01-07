# Фаза 2: Логіка згоди

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Реалізувати збереження вибору та умовне завантаження скриптів аналітики.

## Задачі

### 2.1 Збереження вибору
- [ ] Створити hook `useCookiesConsent` або контекст
- [ ] Зберігати стан в localStorage: `cookies_consent: "accepted" | "rejected" | null`
- [ ] Приховувати банер якщо є збережений вибір

**Файли:** `frontend/src/hooks/useCookiesConsent.ts` або `frontend/src/components/CookiesBanner.tsx`

---

### 2.2 Умовне завантаження аналітики
- [ ] GA4 і Meta Pixel завантажувати тільки якщо `consent === "accepted"`
- [ ] Оновити layout.tsx для умовного рендерингу скриптів
- [ ] Перевірити що скрипти НЕ завантажуються при "rejected"

**Файли:** `frontend/src/app/layout.tsx`

---

### 2.3 Env змінна для вимкнення
- [ ] Додати `NEXT_PUBLIC_COOKIES_BANNER_ENABLED=true|false`
- [ ] Якщо false — не показувати банер, завантажувати аналітику одразу

**Файли:** `frontend/.env.local`

---

### 2.4 Тестування
- [ ] Очистити localStorage, перевірити показ банера
- [ ] Прийняти cookies, перевірити збереження та завантаження аналітики
- [ ] Відхилити cookies, перевірити що аналітика НЕ завантажується

**Нотатки:** -

---

## При завершенні фази

1. Виконай фінальний коміт:
   ```bash
   git add .
   git commit -m "checklist(cookies): completed

   - Cookies consent banner
   - LocalStorage persistence
   - Conditional analytics loading"
   ```
2. Онови PROGRESS.md — задача завершена!
