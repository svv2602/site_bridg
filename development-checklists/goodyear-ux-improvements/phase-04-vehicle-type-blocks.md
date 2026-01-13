# Фаза 4: Блоки по типах авто

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Додати візуальні картки-блоки для категорій шин за типом авто (легкові, SUV, комерційні) з великими зображеннями, як у Goodyear.

## Референс
Goodyear: Три великі картки з фото автомобілів відповідного типу. Кожна картка містить заголовок, короткий опис та кнопку "Знайти шини".

## Задачі

### 4.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити поточну секцію "Шини за сезоном" на головній
- [ ] Вивчити SeasonCategoryCard.tsx якщо існує
- [ ] Перевірити наявність зображень авто в проекті
- [ ] Вивчити патерни карток з зображеннями

**Команди для пошуку:**
```bash
# Поточна головна
cat frontend/src/app/page.tsx | head -100

# Картки категорій
cat frontend/src/components/SeasonCategoryCard.tsx

# Зображення
ls frontend/public/images/
```

#### B. Аналіз залежностей
- [ ] Чи потрібні нові зображення авто?
- [ ] Чи створювати новий компонент VehicleTypeCard?
- [ ] Чи перевикористати існуючий патерн карток?

**Зображення потрібні:**
- Легковий автомобіль (седан/хетчбек)
- SUV/Кросовер
- Комерційний фургон

**Новий компонент:** VehicleTypeCard.tsx

#### C. Перевірка дизайну
- [ ] Розмір карток: 3 в ряд на desktop?
- [ ] Співвідношення зображення до тексту?
- [ ] Hover ефекти?

**Layout:** 3 колонки на desktop, 1 на mobile
**Розмір картки:** ~400x300px

**Нотатки для перевикористання:** -

---

### 4.1 Підготовка зображень

- [ ] Знайти/створити зображення легкового авто
- [ ] Знайти/створити зображення SUV
- [ ] Знайти/створити зображення комерційного авто
- [ ] Оптимізувати зображення (WebP, 800x600px)
- [ ] Додати в `/public/images/vehicles/`

**Файли:**
- `frontend/public/images/vehicles/passenger-car.webp`
- `frontend/public/images/vehicles/suv-car.webp`
- `frontend/public/images/vehicles/commercial-van.webp`

**Джерела зображень:**
- Unsplash (free)
- Official Bridgestone media kit
- Stock photos

**Нотатки:** -

---

### 4.2 Створення VehicleTypeCard компонента

- [ ] Створити `frontend/src/components/VehicleTypeCard.tsx`
- [ ] Імплементувати картку з великим зображенням
- [ ] Додати overlay з текстом
- [ ] Додати hover ефект (zoom або lift)
- [ ] Зробити всю картку клікабельною (Link)

**Файли:** `frontend/src/components/VehicleTypeCard.tsx`

**Базова структура:**
```tsx
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface VehicleTypeCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
}

export function VehicleTypeCard({ title, description, image, href }: VehicleTypeCardProps) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl"
    >
      {/* Image */}
      <div className="relative h-72 md:h-80">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-sm opacity-90 mb-4">{description}</p>
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          Переглянути шини
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
```

**Нотатки:** -

---

### 4.3 Інтеграція на головну сторінку

- [ ] Додати секцію "Шини за типом авто" на головну
- [ ] Розмістити після секції "Шини за сезоном" або замінити її
- [ ] Створити grid layout для 3 карток

**Файли:** `frontend/src/app/page.tsx`

**Дані для карток:**
```typescript
const vehicleTypes = [
  {
    title: 'Легкові шини',
    description: 'Преміум шини для седанів, хетчбеків та компактних авто.',
    image: '/images/vehicles/passenger-car.webp',
    href: '/passenger-tyres',
  },
  {
    title: 'Шини для SUV',
    description: 'Надійні шини для кросоверів та позашляховиків.',
    image: '/images/vehicles/suv-car.webp',
    href: '/suv-4x4-tyres',
  },
  {
    title: 'Комерційні шини',
    description: 'Шини для фургонів, мікроавтобусів та вантажівок.',
    image: '/images/vehicles/commercial-van.webp',
    href: '/lcv-tyres',
  },
];
```

**Нотатки:** -

---

### 4.4 Стилізація та анімації

- [ ] Додати AnimatedCard wrapper для появи при скролі
- [ ] Налаштувати hover zoom ефект
- [ ] Перевірити контраст тексту на overlay
- [ ] Адаптувати для dark mode (якщо потрібно)

**Файли:** `frontend/src/components/VehicleTypeCard.tsx`

**Анімація появи:**
```tsx
<AnimatedCard delay={idx * 0.15}>
  <VehicleTypeCard {...props} />
</AnimatedCard>
```

**Нотатки:** -

---

### 4.5 Mobile адаптація

- [ ] На mobile: вертикальний stack замість grid
- [ ] Зменшити висоту карток на mobile
- [ ] Перевірити touch interactions
- [ ] Перевірити читабельність тексту

**Файли:** `frontend/src/app/page.tsx`

**Responsive classes:**
```tsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
```

**Нотатки:** -

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
   git commit -m "checklist(goodyear-ux): phase-4 vehicle type blocks completed"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 5
   - Загальний прогрес: 28/48 задач
   - Додай запис в історію
6. Відкрий `phase-05-dealer-locator-homepage.md` та продовж роботу
