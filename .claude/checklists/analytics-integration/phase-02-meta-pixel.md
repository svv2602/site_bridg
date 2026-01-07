# Фаза 2: Meta Pixel

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Встановити Meta Pixel з базовими подіями.

## Задачі

### 2.1 Встановлення Meta Pixel
- [ ] Додати env змінну `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Додати pixel script в layout.tsx
- [ ] Перевірити PageView в Meta Events Manager

**Файли:** `frontend/src/app/layout.tsx`, `frontend/.env.local`

---

### 2.2 Custom events
- [ ] Розширити `frontend/src/lib/analytics.ts` для fbq
- [ ] Event: `ViewContent` — при перегляді картки шини
- [ ] Event: `Search` — при пошуку шин
- [ ] Event: `Contact` — при переході до контактів/дилерів

**Файли:** `frontend/src/lib/analytics.ts`

---

### 2.3 Інтеграція в компоненти
- [ ] Додати fbq events поряд з GA4 events
- [ ] Перевірити що обидві системи працюють разом

**Файли:** Відповідні page.tsx файли

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(analytics): phase-2 Meta Pixel completed"
   ```
2. Онови PROGRESS.md
3. Відкрий phase-03-testing.md
