# Покращення Hero секції

## Поточний стан

### Структура SeasonalHero

```
┌─────────────────────────────────────────────────────────────────┐
│ Background: linear-gradient(zinc-950 → zinc-900 → zinc-800)    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────┐  ┌───────────────────────────┐ │
│  │ [Season Badge]              │  │                           │ │
│  │                             │  │   Quick Search Form       │ │
│  │ H1: Знайдіть ідеальні      │  │   ┌─────────────────────┐ │ │
│  │ шини для вашого авто        │  │   │ За розміром │ За авто│ │ │
│  │                             │  │   ├─────────────────────┤ │ │
│  │ Subtitle text...            │  │   │ Width  Profile  Dia │ │ │
│  │                             │  │   │ [Select] [Sel] [Sel]│ │ │
│  │ ┌──────────┐ ┌──────────┐   │  │   │                     │ │ │
│  │ │ Feature 1│ │ Feature 2│   │  │   │ [Знайти шини]       │ │ │
│  │ └──────────┘ └──────────┘   │  │   └─────────────────────┘ │ │
│  │ ┌──────────┐ ┌──────────┐   │  │                           │ │
│  │ │ Feature 3│ │ Feature 4│   │  ├───────────────────────────┤ │
│  │ └──────────┘ └──────────┘   │  │   Season Visual Card      │ │
│  │                             │  │   ┌─────────────────────┐ │ │
│  │ [CTA Button]                │  │   │ ❄️ Зимовий сезон    │ │ │
│  │                             │  │   │ 2025/26             │ │ │
│  └─────────────────────────────┘  │   └─────────────────────┘ │ │
│                                   └───────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Проблеми

1. **Фон занадто плоский** — чистий градієнт без текстури чи глибини
2. **Немає фокальної точки** — відсутнє зображення продукту (шина)
3. **Перевантаженість** — забагато елементів конкурують за увагу
4. **Форма пошуку занадто велика** — займає 50% простору
5. **Season card відволікає** — додатковий елемент без чіткої функції
6. **Низький контраст** — zinc-300 текст на zinc-900 фоні
7. **Немає динаміки** — статичний layout, немає руху

---

## Рекомендована структура

### Новий layout: "Focused Hero"

```
┌─────────────────────────────────────────────────────────────────┐
│ Background: Gradient + Subtle pattern + Ambient glow            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      [Breadcrumb]                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────┐                            │
│  │ [Seasonal Tag: Зимова колекція] │                            │
│  └─────────────────────────────────┘                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │  H1: Знайдіть ідеальні шини                            │    │
│  │      для вашого авто                                    │    │
│  │                                                         │    │
│  │  Subtitle: Більше 150 моделей від Bridgestone          │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │        ┌─────────────────────────────────────────┐        │  │
│  │        │      COMPACT SEARCH BAR                 │        │  │
│  │        │  [Width ▼] [Profile ▼] [Dia ▼] [🔍]     │        │  │
│  │        └─────────────────────────────────────────┘        │  │
│  │                                                           │  │
│  │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │   │ 🚗 Легкові   │  │ 🚙 SUV/4x4   │  │ 🚐 Комерційні │   │  │
│  │   └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│                        [HERO IMAGE]                             │
│                    ┌─────────────────┐                          │
│                    │                 │                          │
│                    │   🔘 TYRE 3D    │ ← Floating, з тінню      │
│                    │                 │                          │
│                    └─────────────────┘                          │
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Trust 1   │ │Trust 2   │ │Trust 3   │ │Trust 4   │           │
│  │150+ шин  │ │50+ дилерів│ │Гарантія  │ │EU Label  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Детальні рекомендації

### 1. Фон та атмосфера

**Поточний:**
```css
background: linear-gradient(to bottom, #09090b, #18181b, #27272a);
```

**Рекомендований:**
```css
.hero-bg {
  /* Base warm gradient */
  background: linear-gradient(
    165deg,
    #0c0a09 0%,      /* stone-950 */
    #1c1917 40%,     /* stone-900 */
    #292524 100%     /* stone-800 */
  );

  /* Subtle grid pattern overlay */
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Ambient glow effect */
.hero-bg::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 800px;
  height: 600px;
  background: radial-gradient(
    ellipse,
    rgba(227, 6, 19, 0.15) 0%,
    transparent 70%
  );
  filter: blur(100px);
  pointer-events: none;
}
```

### 2. Типографіка Hero

**H1 — Головний заголовок:**
```css
.hero-title {
  font-size: clamp(2.25rem, 5vw, 3.75rem); /* 36px → 60px */
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #fafaf9; /* stone-50 */

  /* Subtle text shadow для глибини */
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}
```

**Subtitle:**
```css
.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem); /* 16px → 20px */
  font-weight: 400;
  line-height: 1.6;
  color: #d6d3d1; /* stone-300 */
  max-width: 480px;
}
```

### 3. Compact Search Bar

**Замість великої форми — inline search:**

```jsx
<div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-lg
                border border-white/10 rounded-full p-2 pl-4">
  <select className="bg-transparent text-white text-sm">
    <option>Ширина</option>
    <option>205</option>
    <option>215</option>
  </select>
  <span className="text-white/30">/</span>
  <select className="bg-transparent text-white text-sm">
    <option>Профіль</option>
    <option>55</option>
    <option>60</option>
  </select>
  <span className="text-white/30">R</span>
  <select className="bg-transparent text-white text-sm">
    <option>Діаметр</option>
    <option>16</option>
    <option>17</option>
  </select>
  <button className="bg-primary hover:bg-primary-dark text-white
                     rounded-full p-3 ml-2 transition-all">
    <SearchIcon className="w-5 h-5" />
  </button>
</div>
```

**Стилі:**
```css
.search-compact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 0.5rem 0.5rem 0.5rem 1.5rem;
}

.search-compact select {
  background: transparent;
  border: none;
  color: white;
  font-size: 0.875rem;
  padding: 0.5rem;
  cursor: pointer;
}

.search-compact select:focus {
  outline: none;
}
```

### 4. Category Quick Links

**3 категорії під search:**
```jsx
<div className="flex flex-wrap justify-center gap-4 mt-6">
  <Link href="/passenger-tyres"
        className="flex items-center gap-2 px-5 py-3
                   bg-white/5 hover:bg-white/10
                   border border-white/10 rounded-full
                   text-white/80 hover:text-white
                   transition-all duration-300">
    <Car className="w-5 h-5" />
    <span>Легкові</span>
  </Link>
  {/* SUV/4x4, Комерційні */}
</div>
```

### 5. Hero Image (Шина)

**Floating 3D tyre image:**
```css
.hero-tyre {
  position: relative;
  width: 400px;
  height: 400px;
  margin: 2rem auto;
}

.hero-tyre img {
  width: 100%;
  height: 100%;
  object-fit: contain;

  /* Floating animation */
  animation: float 6s ease-in-out infinite;

  /* Drop shadow для 3D ефекту */
  filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.5));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(3deg);
  }
}
```

**Responsive розміри:**
```css
@media (max-width: 768px) {
  .hero-tyre {
    width: 280px;
    height: 280px;
    margin: 1.5rem auto;
  }
}

@media (min-width: 1024px) {
  .hero-tyre {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    width: 500px;
    height: 500px;
  }
}
```

### 6. Trust Indicators

**Горизонтальні badges внизу hero:**
```jsx
<div className="flex flex-wrap justify-center gap-6 mt-8
                py-6 border-t border-white/10">
  {[
    { icon: Tire, value: "150+", label: "моделей шин" },
    { icon: MapPin, value: "50+", label: "офіційних дилерів" },
    { icon: Shield, value: "5 років", label: "гарантії" },
    { icon: Award, value: "EU Label", label: "сертифікація" },
  ].map((item) => (
    <div key={item.label} className="flex items-center gap-3 text-white/80">
      <item.icon className="w-6 h-6 text-primary" />
      <div>
        <div className="font-bold text-white">{item.value}</div>
        <div className="text-sm text-white/60">{item.label}</div>
      </div>
    </div>
  ))}
</div>
```

---

## Анімації Hero

### Entrance animations (Framer Motion)

```javascript
// Staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0, 0, 0.2, 1],
    },
  },
};

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>
    <Badge>Зимова колекція</Badge>
  </motion.div>
  <motion.h1 variants={itemVariants}>
    Знайдіть ідеальні шини
  </motion.h1>
  <motion.div variants={itemVariants}>
    <SearchBar />
  </motion.div>
</motion.div>
```

### Tyre float animation

```javascript
const tyreVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.5,
      ease: [0, 0, 0.2, 1],
    },
  },
};

// Continuous float
const floatAnimation = {
  y: [0, -20, 0],
  rotate: [0, 3, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
```

---

## Mobile-specific Hero

### Структура для мобільних

```
┌─────────────────────────────┐
│ [Seasonal Badge]            │
├─────────────────────────────┤
│                             │
│  H1: Знайдіть               │
│  ідеальні шини              │
│                             │
│  Subtitle text...           │
│                             │
├─────────────────────────────┤
│                             │
│    [TYRE IMAGE]             │
│    (smaller, centered)      │
│                             │
├─────────────────────────────┤
│                             │
│  [Full-width Search Button] │
│  "Знайти шини за розміром"  │
│                             │
├─────────────────────────────┤
│ ┌─────────┐ ┌─────────┐     │
│ │Легкові  │ │SUV      │     │
│ └─────────┘ └─────────┘     │
│ ┌─────────┐ ┌─────────┐     │
│ │Комерц.  │ │Всі шини │     │
│ └─────────┘ └─────────┘     │
├─────────────────────────────┤
│ Trust indicators (2x2 grid) │
└─────────────────────────────┘
```

### Mobile-first CSS

```css
.hero-mobile {
  padding: 1.5rem 1rem 2rem;
  min-height: 100svh; /* Safe viewport height */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title-mobile {
  font-size: 2rem;
  text-align: center;
}

.hero-tyre-mobile {
  width: 200px;
  height: 200px;
  margin: 1.5rem auto;
}

.hero-search-mobile {
  width: 100%;
  padding: 1rem 1.5rem;
  background: var(--primary);
  color: white;
  border-radius: 9999px;
  font-weight: 600;
  text-align: center;
}

.hero-categories-mobile {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
}
```

---

## Порівняння До/Після

### До (Current)
- ❌ Плоский zinc градієнт
- ❌ Занадто багато тексту
- ❌ Велика форма пошуку справа
- ❌ Немає зображення продукту
- ❌ Season card займає простір
- ❌ 4 feature bullets конкурують за увагу

### Після (Recommended)
- ✅ Теплий gradient з ambient glow
- ✅ Фокус на headline та search
- ✅ Compact inline search bar
- ✅ Floating 3D tyre image
- ✅ Quick category links
- ✅ Trust indicators внизу

---

## Приклад коду (оновлений SeasonalHero)

```tsx
export function SeasonalHero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden">
      {/* Background with glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[800px] h-[600px] bg-primary/15 blur-[100px] rounded-full" />
      </div>

      <div className="relative container mx-auto px-6 py-20">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">

          {/* Seasonal Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-2
                           bg-sky-500/20 text-sky-300 rounded-full text-sm">
              <Snowflake className="w-4 h-4" />
              Зимова колекція 2025/26
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants}
                     className="mt-6 text-4xl md:text-5xl lg:text-6xl
                                font-extrabold text-stone-50 leading-tight">
            Знайдіть ідеальні шини<br />
            для вашого авто
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={itemVariants}
                    className="mt-4 text-lg text-stone-300 max-w-lg">
            Більше 150 моделей від Bridgestone з безкоштовною доставкою
          </motion.p>

          {/* Compact Search */}
          <motion.div variants={itemVariants} className="mt-8">
            <CompactSearchBar />
          </motion.div>

          {/* Category Links */}
          <motion.div variants={itemVariants}
                      className="flex flex-wrap gap-3 mt-6">
            <CategoryLink href="/passenger-tyres" icon={Car}>Легкові</CategoryLink>
            <CategoryLink href="/suv-4x4-tyres" icon={Truck}>SUV/4x4</CategoryLink>
            <CategoryLink href="/lcv-tyres" icon={Bus}>Комерційні</CategoryLink>
          </motion.div>

        </motion.div>

        {/* Floating Tyre Image */}
        <motion.div
          variants={tyreVariants}
          animate={floatAnimation}
          className="absolute right-[5%] top-1/2 -translate-y-1/2
                     w-[400px] h-[400px] hidden lg:block">
          <Image
            src="/images/hero-tyre.png"
            alt="Bridgestone шина"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* Trust Indicators */}
        <TrustIndicators className="absolute bottom-8 left-0 right-0" />

      </div>
    </section>
  );
}
```
