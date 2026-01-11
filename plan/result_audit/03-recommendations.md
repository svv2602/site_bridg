# Рекомендації з дизайну

## 1. Колірна палітра

### Основні зміни

#### Нейтральні кольори (КРИТИЧНО)

**Поточний стан — Zinc (холодний):**
```css
--zinc-50:  #fafafa
--zinc-100: #f4f4f5
--zinc-200: #e4e4e7
--zinc-700: #3f3f46
--zinc-800: #27272a
--zinc-900: #18181b
--zinc-950: #09090b
```

**Рекомендація — Stone (теплий):**
```css
--stone-50:  #fafaf9  /* Warm white */
--stone-100: #f5f5f4  /* Light background */
--stone-200: #e7e5e4  /* Borders light mode */
--stone-700: #44403c  /* Borders dark mode */
--stone-800: #292524  /* Cards dark mode */
--stone-900: #1c1917  /* Main dark */
--stone-950: #0c0a09  /* Deepest dark */
```

#### Впровадження в Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#fafaf9',  // stone-50
          dark: '#0c0a09',     // stone-950
        },
        foreground: {
          DEFAULT: '#1c1917',  // stone-900
          dark: '#fafaf9',     // stone-50
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#292524',     // stone-800
        },
        border: {
          DEFAULT: '#e7e5e4',  // stone-200
          dark: '#44403c',     // stone-700
        },
        muted: {
          DEFAULT: '#78716c',  // stone-500
          dark: '#a8a29e',     // stone-400
        },
      },
    },
  },
}
```

#### Акцентні кольори

```css
/* Додати до палітри */
--amber-warm: #f59e0b;     /* Теплий CTA альтернатива */
--emerald-tech: #10b981;   /* Технології, еко */
--sky-trust: #0ea5e9;      /* Інформаційні елементи */
```

### Оновлення globals.css

```css
:root {
  /* Замінити zinc на stone */
  --background: #fafaf9;
  --foreground: #1c1917;
  --card: #ffffff;
  --card-foreground: #1c1917;
  --border: #e7e5e4;
  --muted: #78716c;
  --muted-foreground: #57534e;

  /* Brand colors залишаються */
  --primary: #e30613;
  --primary-dark: #b8050f;
  --primary-light: #ff3344;
}

[data-theme="dark"] {
  --background: #0c0a09;
  --foreground: #fafaf9;
  --card: #292524;
  --card-foreground: #fafaf9;
  --border: #44403c;
  --muted: #a8a29e;
  --muted-foreground: #d6d3d1;
}
```

---

## 2. Шрифти

### Рекомендовані шрифти

#### Основний: Inter

**Переваги:**
- Відмінна читабельність на екрані
- Повна підтримка кирилиці
- Variable font (оптимізація розміру)
- Широкий діапазон ваг (100-900)

**Підключення:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* Або через next/font для оптимізації */
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
})
```

#### Альтернатива: Plus Jakarta Sans

**Для більш дружнього вигляду:**
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
```

#### Monospace: JetBrains Mono

**Для технічних даних (розміри шин):**
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

### Типографічна шкала

```css
:root {
  /* Font sizes */
  --text-xs:    0.875rem;   /* 14px - мінімум */
  --text-sm:    1rem;       /* 16px */
  --text-base:  1.125rem;   /* 18px */
  --text-lg:    1.25rem;    /* 20px */
  --text-xl:    1.5rem;     /* 24px */
  --text-2xl:   1.875rem;   /* 30px */
  --text-3xl:   2.25rem;    /* 36px */
  --text-4xl:   3rem;       /* 48px */
  --text-5xl:   3.75rem;    /* 60px */

  /* Line heights */
  --leading-tight:  1.2;
  --leading-snug:   1.35;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;
  --tracking-normal: 0;
  --tracking-wide:   0.02em;
}
```

### Застосування до елементів

```css
/* Headings */
h1 {
  font-size: var(--text-4xl);
  font-weight: 800;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

@media (min-width: 768px) {
  h1 {
    font-size: var(--text-5xl);
  }
}

h2 {
  font-size: var(--text-2xl);
  font-weight: 700;
  line-height: var(--leading-snug);
}

@media (min-width: 768px) {
  h2 {
    font-size: var(--text-3xl);
  }
}

/* Body */
body {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}

/* Small text - не менше 14px */
.text-sm {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
}
```

---

## 3. Сітка та відступи

### Container

```css
.container {
  width: 100%;
  max-width: 1440px;  /* Збільшити з 1280px */
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;   /* 24px mobile */
  padding-right: 1.5rem;
}

@media (min-width: 768px) {
  .container {
    padding-left: 3rem;   /* 48px tablet */
    padding-right: 3rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: 4rem;   /* 64px desktop */
    padding-right: 4rem;
  }
}
```

### Spacing система (8px base)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      '0': '0',
      '1': '0.25rem',   // 4px
      '2': '0.5rem',    // 8px
      '3': '0.75rem',   // 12px
      '4': '1rem',      // 16px
      '5': '1.25rem',   // 20px
      '6': '1.5rem',    // 24px
      '7': '1.75rem',   // 28px
      '8': '2rem',      // 32px
      '10': '2.5rem',   // 40px
      '12': '3rem',     // 48px
      '14': '3.5rem',   // 56px
      '16': '4rem',     // 64px
      '20': '5rem',     // 80px
      '24': '6rem',     // 96px
      '32': '8rem',     // 128px
    },
  },
}
```

### Section padding

```css
/* Section rhythm */
.section {
  padding-top: 3rem;      /* 48px mobile */
  padding-bottom: 3rem;
}

@media (min-width: 768px) {
  .section {
    padding-top: 4rem;    /* 64px tablet */
    padding-bottom: 4rem;
  }
}

@media (min-width: 1024px) {
  .section {
    padding-top: 5rem;    /* 80px desktop */
    padding-bottom: 5rem;
  }
}
```

### Grid layouts

```css
/* Products grid */
.grid-products {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(1, 1fr);
}

@media (min-width: 640px) {
  .grid-products {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .grid-products {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .grid-products {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 4. Ієрархія елементів

### Z-index система

```css
:root {
  --z-base:      0;
  --z-dropdown:  10;
  --z-sticky:    20;
  --z-fixed:     30;
  --z-modal-bg:  40;
  --z-modal:     50;
  --z-popover:   60;
  --z-tooltip:   70;
  --z-toast:     80;
}
```

### Border-radius система

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    borderRadius: {
      'none': '0',
      'sm': '6px',
      DEFAULT: '12px',
      'md': '16px',
      'lg': '20px',
      'xl': '24px',
      '2xl': '32px',
      'full': '9999px',
    },
  },
}
```

### Застосування border-radius

| Елемент | Поточний | Рекомендація |
|---------|----------|--------------|
| Button | `rounded-full` | `rounded-full` ✓ |
| Input | `rounded-xl` (12px) | `rounded` (12px) ✓ |
| Card small | `rounded-lg` (8px) | `rounded-md` (16px) |
| Card medium | `rounded-xl` (12px) | `rounded-lg` (20px) |
| Card large | `rounded-2xl` (16px) | `rounded-xl` (24px) |
| Modal | `rounded-2xl` (16px) | `rounded-2xl` (32px) |
| Badge | `rounded-md` (6px) | `rounded` (12px) |
| Tag | `rounded-full` | `rounded-full` ✓ |

### Shadow система

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    boxShadow: {
      'sm': '0 1px 2px rgba(28, 25, 23, 0.05)',
      DEFAULT: '0 2px 8px rgba(28, 25, 23, 0.08)',
      'md': '0 4px 16px rgba(28, 25, 23, 0.1)',
      'lg': '0 8px 32px rgba(28, 25, 23, 0.12)',
      'xl': '0 16px 48px rgba(28, 25, 23, 0.15)',
      '2xl': '0 24px 64px rgba(28, 25, 23, 0.18)',
      'inner': 'inset 0 2px 4px rgba(28, 25, 23, 0.06)',
      'glow': '0 0 40px rgba(227, 6, 19, 0.3)',
      'glow-lg': '0 0 60px rgba(227, 6, 19, 0.4)',
    },
  },
}
```

### Hover стани

```css
/* Card hover */
.card {
  box-shadow: theme('boxShadow.DEFAULT');
  transition: all 0.3s ease-out;
}

.card:hover {
  box-shadow: theme('boxShadow.lg');
  transform: translateY(-4px);
}

/* Button hover */
.btn-primary {
  transition: all 0.2s ease-out;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: theme('boxShadow.md');
}

.btn-primary:active {
  transform: scale(0.98);
}
```

---

## 5. Компонентні рекомендації

### Button стилі

```css
/* Primary Button */
.btn-primary {
  background: var(--primary);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease-out;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: scale(1.02);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--foreground);
  padding: 0.875rem 2rem;
  border: 2px solid var(--border);
  border-radius: 9999px;
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--card);
  border-color: var(--muted);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--primary);
  padding: 0.75rem 1.5rem;
}

.btn-ghost:hover {
  background: rgba(227, 6, 19, 0.1);
}
```

### Card стилі

```css
/* Base Card */
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(28, 25, 23, 0.08);
  transition: all 0.3s ease-out;
}

.card:hover {
  box-shadow: 0 8px 32px rgba(28, 25, 23, 0.12);
  transform: translateY(-4px);
}

/* Glass Card (для темного фону) */
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}
```

### Badge стилі

```css
/* Base Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Season Badges */
.badge-summer {
  background: linear-gradient(135deg, #fb923c, #ea580c);
  color: white;
}

.badge-winter {
  background: linear-gradient(135deg, #38bdf8, #0284c7);
  color: white;
}

.badge-allseason {
  background: linear-gradient(135deg, #34d399, #059669);
  color: white;
}
```

### Input стилі

```css
/* Text Input */
.input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--card);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.1);
}

/* Select */
.select {
  appearance: none;
  padding-right: 2.5rem;
  background-image: url("data:image/svg+xml,..."); /* chevron */
  background-position: right 1rem center;
  background-repeat: no-repeat;
}
```

---

## 6. Motion рекомендації

### Transitions

```css
/* Базові transitions */
.transition-fast {
  transition: all 0.15s ease-out;
}

.transition-normal {
  transition: all 0.3s ease-out;
}

.transition-slow {
  transition: all 0.5s ease-out;
}

/* Spring-like для інтерактивних */
.transition-spring {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Framer Motion presets

```javascript
// lib/motion.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0, 0, 0.2, 1] }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
}

export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
}
```

---

## 7. Responsive рекомендації

### Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
  },
}
```

### Mobile-first patterns

```css
/* Typography scaling */
.hero-title {
  font-size: 2.25rem;     /* 36px mobile */
  line-height: 1.2;
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 2.75rem;   /* 44px sm */
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3rem;      /* 48px md */
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 3.75rem;   /* 60px lg */
  }
}
```

### Touch targets

```css
/* Мінімальний розмір для touch */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Збільшені відступи на мобільних */
@media (max-width: 767px) {
  .btn {
    padding: 1rem 1.5rem;
  }

  .nav-link {
    padding: 1rem;
  }
}
```
