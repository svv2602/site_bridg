# Фаза 1: UI компонент

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити UI компонент банера cookies.

## Задачі

### 1.1 Компонент CookiesBanner
- [ ] Створити `frontend/src/components/CookiesBanner.tsx`
- [ ] Фіксований блок внизу екрана
- [ ] Текст: "Ми використовуємо cookies для покращення роботи сайту"
- [ ] Кнопки: "Прийняти", "Відхилити", "Налаштування" (опційно)

**Файли:** `frontend/src/components/CookiesBanner.tsx`

---

### 1.2 Стилізація
- [ ] Використати патерни проекту (rounded-2xl, bg-card, border-border)
- [ ] Адаптивність для mobile
- [ ] Z-index вище за інші елементи

**Референс стилів:**
```tsx
className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md
           rounded-2xl border border-border bg-card p-6 shadow-2xl z-50"
```

---

### 1.3 Інтеграція в layout
- [ ] Додати CookiesBanner в layout.tsx
- [ ] Перевірити відображення

**Файли:** `frontend/src/app/layout.tsx`

---

## При завершенні фази

1. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(cookies): phase-1 UI completed"
   ```
2. Відкрий phase-02-logic.md
