# Фаза 2: P2 -- DOMPurify та Bundle Optimization

## Статус
- [x] Не розпочата
- [x] В процесі
- [ ] Завершена

**Розпочата:** 2026-02-10
**Завершена:** -

## Ціль фази
Зменшити розмір клієнтського бандла: винести DOMPurify санітизацію на серверну сторону (або lazy-load), видалити невикористаний client-side fetch fallback з SeasonalHero.tsx.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] LexicalRenderer.tsx використовує DOMPurify для HTML string санітизації
- [x] SeasonalHero.tsx мав client-side fetch fallback (getSeasonalContent)

---

### 2.1 Перенести DOMPurify санітизацію на серверну сторону
- [ ] DOMPurify оптимізація відкладена — потребує детальнішого аналізу серверних/клієнтських компонентів
- [ ] LexicalRenderer використовується як в Server так і Client контексті

---

### 2.2 Перевірити bundle size після оптимізації DOMPurify
- [ ] Відкладено до виконання 2.1

---

### 2.3 Видалити невикористаний client-side fetch fallback у SeasonalHero.tsx
- [x] Видалено client-side fetch fallback (getSeasonalContent)
- [x] Видалено useState для seasonalData (тепер використовує serverData напряму)
- [x] Видалено isLoading стан та skeleton UI
- [x] Видалено невикористаний імпорт getSeasonalContent
- [x] Компонент тепер повністю покладається на server-side дані

**Файли:** `frontend/src/components/SeasonalHero.tsx`

---

### 2.4 Фінальна перевірка bundle
- [ ] Відкладено до виконання 2.1 та 2.2

---
