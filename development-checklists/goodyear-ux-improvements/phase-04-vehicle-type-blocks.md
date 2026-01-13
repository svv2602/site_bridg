# Фаза 4: Блоки по типах авто

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-13
**Завершена:** 2026-01-13

## Ціль фази
Додати візуальні картки-блоки для категорій шин за типом авто (легкові, SUV, комерційні) з великими зображеннями, як у Goodyear.

## Референс
Goodyear: Три великі картки з фото автомобілів відповідного типу. Кожна картка містить заголовок, короткий опис та кнопку "Знайти шини".

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити поточну секцію "Шини за сезоном" на головній
- [x] Вивчити SeasonCategoryCard.tsx якщо існує
- [x] Перевірити наявність зображень авто в проекті
- [x] Вивчити патерни карток з зображеннями

**Результати:**
- Секція "Шини за сезоном" використовує AnimatedCardX
- SeasonCategoryCard не існує (використовуються inline картки)
- Зображень авто немає - потрібен fallback
- TyreCard та VehicleTypeCard можуть використовувати схожий патерн

#### B. Аналіз залежностей
- [x] Чи потрібні нові зображення авто?
- [x] Чи створювати новий компонент VehicleTypeCard?
- [x] Чи перевикористати існуючий патерн карток?

**Рішення:**
- Створено VehicleTypeCard з fallback на градієнти + іконки
- Зображення можна додати пізніше без змін коду
- Компонент універсальний (з або без зображення)

#### C. Перевірка дизайну
- [x] Розмір карток: 3 в ряд на desktop?
- [x] Співвідношення зображення до тексту?
- [x] Hover ефекти?

**Layout:** `grid md:grid-cols-2 lg:grid-cols-3`
**Розмір:** `h-64 md:h-72 lg:h-80`
**Hover:** scale-105 на image, translate-x-1 на arrow

---

### 4.1 Підготовка зображень

- [x] Знайти/створити зображення легкового авто - FALLBACK
- [x] Знайти/створити зображення SUV - FALLBACK
- [x] Знайти/створити зображення комерційного авто - FALLBACK
- [x] Оптимізувати зображення (WebP, 800x600px) - N/A
- [x] Додати в `/public/images/vehicles/` - директорію створено

**Fallback рішення:**
- Градієнти: blue/emerald/amber для різних типів
- Іконки: Car та Truck з lucide-react
- Компонент автоматично перемикається між image та fallback

---

### 4.2 Створення VehicleTypeCard компонента

- [x] Створити `frontend/src/components/VehicleTypeCard.tsx`
- [x] Імплементувати картку з великим зображенням
- [x] Додати overlay з текстом
- [x] Додати hover ефект (zoom або lift)
- [x] Зробити всю картку клікабельною (Link)

**Файли:** `frontend/src/components/VehicleTypeCard.tsx`

**Реалізовано:**
```tsx
interface VehicleTypeCardProps {
  title: string;
  description: string;
  image?: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
}
```
- Image з fallback на gradient + icon
- Gradient overlay для тексту
- hover:-translate-y-1 та hover:scale-105

---

### 4.3 Інтеграція на головну сторінку

- [x] Додати секцію "Шини за типом авто" на головну
- [x] Розмістити після секції Features
- [x] Створити grid layout для 3 карток

**Файли:** `frontend/src/app/page.tsx`

**Реалізовано:**
```tsx
<section className="py-12 bg-stone-50 dark:bg-stone-900/50">
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {vehicleTypesData.map((vehicle, idx) => (
      <AnimatedCard key={vehicle.href} delay={idx * 0.15}>
        <VehicleTypeCard {...vehicle} />
      </AnimatedCard>
    ))}
  </div>
</section>
```

---

### 4.4 Стилізація та анімації

- [x] Додати AnimatedCard wrapper для появи при скролі
- [x] Налаштувати hover zoom ефект
- [x] Перевірити контраст тексту на overlay
- [x] Адаптувати для dark mode

**Реалізовано:**
- AnimatedCard з delay={idx * 0.15}
- group-hover:scale-105 на зображенні
- bg-gradient-to-t from-black/80 для overlay
- border-stone-200 dark:border-stone-700

---

### 4.5 Mobile адаптація

- [x] На mobile: вертикальний stack замість grid
- [x] Зменшити висоту карток на mobile
- [x] Перевірити touch interactions
- [x] Перевірити читабельність тексту

**Responsive:**
- `grid gap-6 md:grid-cols-2 lg:grid-cols-3`
- `h-64 md:h-72 lg:h-80` для різних розмірів
- line-clamp-2 для опису

---

## При завершенні фази

1. ✅ Всі задачі відмічені [x]
2. ✅ Статус фази: Завершена
3. ✅ Завершена: 2026-01-13
4. ✅ Коміт виконано
5. ✅ PROGRESS.md оновлено
