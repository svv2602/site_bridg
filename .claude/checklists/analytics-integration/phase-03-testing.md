# Фаза 3: Тестування

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Перевірити роботу аналітики в debug режимі та продакшені.

## Задачі

### 3.1 GA4 Debug
- [ ] Встановити Google Analytics Debugger extension
- [ ] Перевірити pageviews на різних сторінках
- [ ] Перевірити custom events
- [ ] Перевірити Real-time звіти в GA4

**Нотатки:** -

---

### 3.2 Meta Pixel Debug
- [ ] Встановити Meta Pixel Helper extension
- [ ] Перевірити PageView events
- [ ] Перевірити custom events
- [ ] Перевірити в Meta Events Manager → Test Events

**Нотатки:** -

---

### 3.3 Документація
- [ ] Оновити CLAUDE.md з env змінними аналітики
- [ ] Додати список подій які відстежуються

**Файли:** `CLAUDE.md`

---

## При завершенні фази

1. Виконай фінальний коміт:
   ```bash
   git add .
   git commit -m "checklist(analytics): completed

   - GA4 integration with custom events
   - Meta Pixel integration
   - Events: tyre_search, tyre_view, dealer_click, phone_click"
   ```
2. Онови PROGRESS.md — задача завершена!
