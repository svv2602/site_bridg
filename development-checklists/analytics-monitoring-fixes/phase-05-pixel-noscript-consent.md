# Фаза 5: P3 -- Meta Pixel noscript, Consent Polling

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати noscript fallback для Meta Pixel (стандартна рекомендація Meta). Замінити setInterval(1000ms) consent polling на ефективніший механізм (MutationObserver або CustomEvent).

**Джерело:** ANALYTICS_MONITORING_AUDIT L1, L2

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити як Meta Pixel ініціалізується в Analytics.tsx
- [ ] Вивчити consent polling механізм (setInterval, рядки 31-36)
- [ ] Перевірити як CookiesBanner зберігає consent (localStorage key/value)

**Команди для пошуку:**
```bash
# Meta Pixel ініціалізація
grep -n "fbq\|meta.*pixel\|fbevents" frontend/src/components/Analytics.tsx
# Consent polling
grep -n "setInterval\|consent\|shouldLoad" frontend/src/components/Analytics.tsx
# Cookie consent storage
grep -n "localStorage\|consent\|cookie" frontend/src/components/CookiesBanner.tsx
```

#### B. Аналіз залежностей
- [ ] Який localStorage key використовує CookiesBanner?
- [ ] Чи є інші компоненти що слухають зміну consent?

**Нові типи:** -
**Нові API-функції:** -
**Нові компоненти:** -

**Ціль:** Зрозуміти поточний механізм consent та визначити оптимальний підхід.

**Нотатки для перевикористання:** -

---

### 5.1 Додати noscript fallback для Meta Pixel
- [ ] В Analytics.tsx додати noscript img тег для Meta Pixel:
  ```tsx
  {metaPixelId && (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  )}
  ```
- [ ] Розмістити після основного Script тегу Meta Pixel
- [ ] Перевірити що noscript тег рендериться в HTML (View Source)

**Файли:** `frontend/src/components/Analytics.tsx`
**Нотатки:** noscript img трекає тільки initial page load для користувачів без JavaScript. Це стандартна рекомендація Meta для повного покриття.

---

### 5.2 Замінити setInterval consent polling
- [ ] Варіант 1 (рекомендований): CustomEvent
  - В CookiesBanner при зміні consent dispatch:
    ```tsx
    window.dispatchEvent(new CustomEvent('consent-changed', { detail: { accepted: true } }));
    ```
  - В Analytics.tsx замість setInterval слухати:
    ```tsx
    window.addEventListener('consent-changed', (e) => {
      setShouldLoad((e as CustomEvent).detail.accepted);
    });
    ```
- [ ] Варіант 2: storage event (працює між вкладками)
  - В CookiesBanner зберігати в localStorage (вже робить)
  - В Analytics.tsx слухати `window.addEventListener('storage', ...)`
- [ ] Видалити setInterval(1000ms) polling
- [ ] Перевірити що аналітика завантажується після прийняття cookies

**Файли:** `frontend/src/components/Analytics.tsx`, `frontend/src/components/CookiesBanner.tsx`
**Нотатки:** CustomEvent ефективніший за polling кожну секунду. Для cross-tab sync можна додатково використати storage event.

---

## При завершенні фази

Виконай наступні дії:

1. Переконайся, що всі задачі відмічені [x]
2. Зміни статус фази:
   - [x] Завершена
3. Заповни дату "Завершена: YYYY-MM-DD"
4. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(analytics-monitoring-fixes): phase-5 Meta Pixel noscript, consent polling completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: завершено
   - Додай запис в історію
6. Перевір всі критерії успіху в README.md
