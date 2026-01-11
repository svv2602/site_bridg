# Концепція редизайну

## Філософія нового дизайну

### Від "Технічного каталогу" до "Преміального досвіду"

**Поточне сприйняття:**
> "Це корисний сайт для пошуку шин, але виглядає як B2B портал"

**Цільове сприйняття:**
> "Це преміальний бренд, якому можна довіряти. Тут приємно обирати шини"

---

## Mood Board: "Precision Craft"

### Ключові характеристики стилю

| Атрибут | Опис |
|---------|------|
| **Настрій** | Впевненість, надійність, японська точність |
| **Тон** | Теплий професіоналізм (не холодний корпоратив) |
| **Естетика** | Clean luxury з технічними акцентами |
| **Динаміка** | Стриманий рух, плавні переходи |
| **Контраст** | Високий, чіткі межі, виразна типографіка |

### Візуальні метафори

1. **Японська точність** — чисті лінії, увага до деталей
2. **Дорожня динаміка** — плавні криві, відчуття руху
3. **Інженерна надійність** — структурована сітка, баланс
4. **Преміальні матеріали** — глибина, текстури, тіні

---

## Колірна концепція: "Warm Performance"

### Нова палітра

#### Primary Brand Colors
```
Bridgestone Red:     #E30613 (залишається)
Bridgestone Red Dark: #B8050F (для hover)
Bridgestone Red Light: #FF3344 (для акцентів)
```

#### Neutral Foundation (ЗМІНА!)
```
Замість zinc (холодний) → stone/warm-gray (теплий)

Warm Black:    #1C1917 (stone-900) — основний темний
Warm Dark:     #292524 (stone-800) — картки в dark mode
Warm Mid:      #44403C (stone-700) — бордери
Warm Light:    #F5F5F4 (stone-100) — світлий фон
Warm White:    #FAFAF9 (stone-50) — білий з теплотою
```

#### Accent System (НОВИНКА)
```
Amber Warm:    #F59E0B — теплий акцент для CTA
Emerald Tech:  #10B981 — технології, еко
Sky Trust:     #0EA5E9 — довіра, інформація
```

#### Seasonal Colors (оновлені)
```
Summer:     #FB923C → #EA580C (orange-400 → orange-600)
Winter:     #38BDF8 → #0284C7 (sky-400 → sky-600)
All-season: #34D399 → #059669 (emerald-400 → emerald-600)
```

### Приклад застосування

```
┌─────────────────────────────────────────────────────┐
│ HEADER: stone-900 + red accent                      │
├─────────────────────────────────────────────────────┤
│ HERO: Gradient stone-950 → stone-800                │
│       + Subtle warm overlay                         │
│       + Red glow effect behind CTA                  │
├─────────────────────────────────────────────────────┤
│ CONTENT: stone-50 background                        │
│          Cards: white + stone-200 border            │
│          + Soft shadows with warm tint              │
├─────────────────────────────────────────────────────┤
│ FOOTER: stone-900 + structured layout               │
└─────────────────────────────────────────────────────┘
```

---

## Типографічна концепція

### Шрифтова пара

**Primary Font: Inter**
- Сучасний, читабельний, добре масштабується
- Відмінна підтримка кирилиці
- Variable font для оптимізації

**Alternative: Plus Jakarta Sans**
- Геометричний, contemporary feel
- Трохи "friendly" характер

**Monospace (для технічних даних): JetBrains Mono**
- Розміри шин, технічні специфікації

### Масштаб типографіки (Mobile-first)

```
Base:       16px (1rem)
Scale:      1.25 (Major Third)

XS:         12px → 14px (мінімум читабельності)
SM:         14px → 16px
Base:       16px → 18px
LG:         20px → 22px
XL:         24px → 28px
2XL:        30px → 36px
3XL:        38px → 48px
4XL:        48px → 60px (Hero H1)
```

### Line-height система

```
Headings:   1.2 (tight для великих розмірів)
Subheads:   1.3 (semi-tight)
Body:       1.6 (comfortable reading)
Small:      1.5 (compact but readable)
```

### Font-weight система

```
Regular:    400 (body text)
Medium:     500 (emphasis, buttons)
Semibold:   600 (subheadings, labels)
Bold:       700 (headings)
Extrabold:  800 (hero headlines)
```

---

## Layout концепція

### Grid система

**Container:**
```
Max-width: 1440px (замість 1280px)
Padding:   24px mobile, 48px tablet, 64px desktop
```

**Column Grid:**
```
12-column grid
Gutter: 24px mobile, 32px desktop
```

### Spacing Scale (8px base)

```
0:    0px
1:    4px   (0.25rem)
2:    8px   (0.5rem)
3:    12px  (0.75rem)
4:    16px  (1rem)
5:    24px  (1.5rem)
6:    32px  (2rem)
7:    48px  (3rem)
8:    64px  (4rem)
9:    96px  (6rem)
10:   128px (8rem)
```

### Section Rhythm

```
Section padding:
  Mobile:  py-12 (48px)
  Tablet:  py-16 (64px)
  Desktop: py-20 (80px)

Between sections:
  Related:    gap-8 (32px)
  Separate:   gap-16 (64px)
  Major:      gap-24 (96px)
```

---

## Border-radius система

### Нові значення

```
none:   0px      (рідко використовується)
sm:     6px      (tags, small badges)
DEFAULT: 12px   (inputs, small cards)
md:     16px    (medium cards)
lg:     20px    (large cards)
xl:     24px    (modal, hero cards)
2xl:    32px    (featured elements)
full:   9999px  (pills, avatars)
```

### Приклад консистентності

```
Button:       rounded-full (pill shape)
Input:        rounded (12px)
Card:         rounded-xl (20px)
Modal:        rounded-2xl (24px)
Hero Card:    rounded-2xl (24px)
Badge:        rounded-md (8px) → rounded (12px)
```

---

## Shadow система

### Нові тіні (з теплим відтінком)

```css
/* Замість neutral shadow */
--shadow-color: 28 25 23;  /* stone-900 RGB */

shadow-sm:    0 1px 2px rgba(28, 25, 23, 0.05);
shadow:       0 2px 8px rgba(28, 25, 23, 0.08);
shadow-md:    0 4px 16px rgba(28, 25, 23, 0.1);
shadow-lg:    0 8px 32px rgba(28, 25, 23, 0.12);
shadow-xl:    0 16px 48px rgba(28, 25, 23, 0.15);
shadow-2xl:   0 24px 64px rgba(28, 25, 23, 0.18);

/* Glow для акцентів */
shadow-glow:  0 0 40px rgba(227, 6, 19, 0.3);
```

### Hover ефект для карток

```css
.card {
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}
```

---

## Motion Design концепція

### Timing Functions

```css
--ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-in-out:   cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-spring:   cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Scale

```
instant:    75ms   (color changes)
fast:       150ms  (hover states)
normal:     300ms  (transitions)
slow:       500ms  (page elements)
slower:     700ms  (hero animations)
```

### Animation Patterns

**Entrance:**
```javascript
{
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}
```

**Stagger для списків:**
```javascript
{
  container: { staggerChildren: 0.08 },
  item: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 }
  }
}
```

**Hover для кнопок:**
```javascript
{
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400 }
}
```

---

## Ключові UI патерни

### Glass Morphism (для карток на темному)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}
```

### Gradient Overlays

```css
.hero-overlay {
  background: linear-gradient(
    135deg,
    rgba(28, 25, 23, 0.95) 0%,
    rgba(28, 25, 23, 0.7) 50%,
    rgba(28, 25, 23, 0.4) 100%
  );
}
```

### Red Accent Glow

```css
.cta-glow {
  position: relative;
}

.cta-glow::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(
    circle,
    rgba(227, 6, 19, 0.4) 0%,
    transparent 70%
  );
  filter: blur(20px);
  z-index: -1;
}
```

---

## Приклад застосування концепції

### До (поточний стан)
```
┌─────────────────────────────────────────────────────┐
│ zinc-900 header, flat, no depth                     │
├─────────────────────────────────────────────────────┤
│ zinc-950 → zinc-800 gradient                        │
│ Cold, industrial feel                               │
│ Small 8px radius cards                              │
│ Low contrast text (zinc-300)                        │
│ No shadows, flat UI                                 │
└─────────────────────────────────────────────────────┘
```

### Після (нова концепція)
```
┌─────────────────────────────────────────────────────┐
│ stone-900 header + subtle gradient + red glow       │
├─────────────────────────────────────────────────────┤
│ Warm dark gradient + ambient lighting               │
│ Premium, trustworthy feel                           │
│ 20-24px radius glass cards                          │
│ High contrast text (stone-100 on dark)              │
│ Layered shadows, depth perception                   │
│ Subtle animations on scroll                         │
└─────────────────────────────────────────────────────┘
```
