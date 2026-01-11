# Сучасні референси та приклади

## 1. Автомобільна індустрія

### Michelin (michelin.com)

**Що взяти:**
- Clean hero з фокусом на продукт
- Floating product images з soft shadows
- Compact tire finder в header
- Premium feel через white space

**Характеристики:**
- Мінімалістичний підхід
- Велика типографіка
- Якісні product shots
- Subtle animations on scroll

### Continental Tyres (continental-tires.com)

**Що взяти:**
- Dynamic hero з відео-фоном
- Interactive tire selector
- Trust badges під hero
- Seasonal campaign banners

**Характеристики:**
- Dark theme з яскравими акцентами
- Grid-based layout
- Smooth page transitions

### Goodyear (goodyear.eu)

**Що взяти:**
- Card-based product display
- Quick filters
- Comparison feature UI
- Mobile-first navigation

**Характеристики:**
- Yellow accent на dark background
- Geometric shapes
- Icon-driven navigation

---

## 2. Преміальні бренди (Non-Automotive)

### Apple (apple.com)

**Що взяти:**
- Typography-driven hero sections
- Product photography standards
- Scroll-triggered animations
- Minimal UI chrome

**Характеристики:**
- Generous white space
- San Francisco font family
- Subtle gradient backgrounds
- Cinematic product reveals

### Porsche (porsche.com)

**Що взяти:**
- Dark luxury aesthetic
- High-contrast typography
- Immersive imagery
- Configurator UX patterns

**Характеристики:**
- Black/white with red accents
- Bold headlines
- Full-bleed images
- Smooth transitions

### BMW (bmw.com)

**Що взяти:**
- Hero video integration
- Model selector patterns
- Feature highlight cards
- Dealer locator UX

**Характеристики:**
- Blue accent color
- Angular design elements
- Responsive image handling

---

## 3. E-commerce з технічними продуктами

### Specialized Bicycles (specialized.com)

**Що взяти:**
- Technical spec presentation
- Product comparison UI
- Filter system design
- Size guide integration

**Характеристики:**
- Red brand color usage
- Bike finder wizard
- Community integration

### Canyon (canyon.com)

**Що взяти:**
- Product card design
- Technical details expandable
- Price/availability display
- Checkout flow

**Характеристики:**
- Clean product photography
- Modular page sections
- Quick view modals

### Decathlon (decathlon.ua)

**Що взяти:**
- Localized UX patterns
- Ukrainian language handling
- Category navigation
- Filter UI for specs

**Характеристики:**
- Blue brand color
- Icon-driven categories
- Budget-friendly aesthetic

---

## 4. SaaS та Tech (UI Patterns)

### Linear (linear.app)

**Що взяти:**
- Dark mode implementation
- Subtle animations
- Glass morphism cards
- Keyboard shortcuts hint UI

**Характеристики:**
- Purple/violet gradients
- Monospace accents
- Smooth transitions
- Clean data visualization

### Vercel (vercel.com)

**Що взяти:**
- Gradient backgrounds
- Code block styling
- Feature grid layout
- Footer design

**Характеристики:**
- Black/white minimalism
- Geist font (already used!)
- Triangle brand elements
- Developer-focused copy

### Stripe (stripe.com)

**Що взяти:**
- Multi-color gradients
- Interactive demos
- Documentation patterns
- Trust indicator display

**Характеристики:**
- Vibrant color palette
- Animated illustrations
- Clear CTAs
- Tiered pricing cards

---

## 5. Стилістичні напрямки

### A. "Clean Luxury"

**Характеристики:**
- Generous white/dark space
- Minimal UI elements
- Large typography
- High-quality imagery
- Subtle animations

**Приклади:** Apple, Porsche, Audi

**Застосування для Bridgestone:**
- Hero з великим headline
- Premium product photos
- Soft shadows
- Refined color palette

### B. "Technical Premium"

**Характеристики:**
- Dark backgrounds
- Accent color pops
- Data visualization
- Spec sheets design
- Interactive elements

**Приклади:** Specialized, Canyon, Tesla

**Застосування для Bridgestone:**
- EU Label visualization
- Size comparison charts
- Technology explainers
- Spec comparison tables

### C. "Modern Corporate"

**Характеристики:**
- Professional but friendly
- Warm color tones
- Trust-building elements
- Clear navigation
- Accessible design

**Приклади:** Salesforce, HubSpot, Mailchimp

**Застосування для Bridgestone:**
- Trust badges prominent
- Customer testimonials
- Dealer network highlight
- Service guarantees

---

## 6. Конкретні UI елементи

### Hero секції

**Референс: Linear.app**
```
- Gradient mesh background
- Centered headline
- Floating UI elements
- Subtle particle effects
```

**Референс: Stripe.com**
```
- Dynamic color gradients
- Interactive demo embedded
- Trust logos row
- Clear value proposition
```

### Product Cards

**Референс: Apple Store**
```
- Large product image
- Minimal text
- Color options dots
- "Buy" CTA prominent
```

**Референс: Canyon.com**
```
- Spec highlights
- Price display
- Quick actions
- Comparison checkbox
```

### Search/Filter UI

**Референс: Airbnb**
```
- Inline search bar
- Pill-style filters
- Map toggle
- Results count
```

**Референс: Booking.com**
```
- Multi-step search
- Date/location inputs
- Smart suggestions
- Recent searches
```

### Footer

**Референс: Stripe**
```
- Multi-column layout
- Clear link hierarchy
- Language/region selector
- Newsletter signup
```

**Референс: Linear**
```
- Minimal footer
- Essential links only
- Social icons
- Status indicator
```

---

## 7. Колірні схеми референсів

### Dark Theme Excellence

**Linear.app:**
```css
--bg-primary: #0d0d0d;
--bg-secondary: #1a1a1a;
--accent: #5e6ad2;
--text-primary: #f5f5f5;
--text-secondary: #8f8f8f;
```

**Vercel:**
```css
--bg-primary: #000000;
--bg-secondary: #111111;
--accent: #0070f3;
--text-primary: #ffffff;
--text-secondary: #888888;
```

### Warm Premium

**Porsche:**
```css
--bg-primary: #0e0e0e;
--accent-red: #d5001c;
--gold: #c4a35a;
--text-primary: #ffffff;
```

**Tesla:**
```css
--bg-primary: #171a20;
--accent-red: #e82127;
--text-primary: #ffffff;
--text-secondary: #5c5e62;
```

### Рекомендація для Bridgestone

```css
:root {
  /* Warm dark palette */
  --bg-deep: #0c0a09;      /* stone-950 */
  --bg-dark: #1c1917;      /* stone-900 */
  --bg-card: #292524;      /* stone-800 */

  /* Brand colors */
  --accent-red: #e30613;   /* Bridgestone Red */
  --accent-red-dark: #b8050f;
  --accent-red-glow: rgba(227, 6, 19, 0.3);

  /* Text */
  --text-primary: #fafaf9;  /* stone-50 */
  --text-secondary: #a8a29e; /* stone-400 */
  --text-muted: #78716c;    /* stone-500 */

  /* Functional */
  --border: #44403c;        /* stone-700 */
  --success: #10b981;       /* emerald-500 */
  --warning: #f59e0b;       /* amber-500 */
  --info: #0ea5e9;          /* sky-500 */
}
```

---

## 8. Анімаційні референси

### Scroll-triggered

**Референс: Apple iPhone pages**
- Elements fade in as they enter viewport
- Parallax depth effects
- Sticky sections with content changes

### Hover interactions

**Референс: Linear.app**
- Subtle scale (1.02) on cards
- Color transitions (200ms)
- Cursor-following effects

### Page transitions

**Референс: Awwwards winning sites**
- Crossfade between pages
- Slide transitions for related content
- Loading states with branded elements

### Micro-interactions

**Референс: Stripe.com**
- Button press feedback
- Form field focus states
- Success/error animations
- Tooltip appearances

---

## 9. Ресурси для натхнення

### Галереї дизайну
- **Awwwards.com** — преміальні сайти
- **Dribbble.com** — UI концепти
- **Mobbin.com** — мобільні патерни
- **Land-book.com** — лендінги

### UI компоненти
- **ui.shadcn.com** — React компоненти
- **tailwindui.com** — Tailwind templates
- **radix-ui.com** — Accessible primitives

### Анімації
- **framer.com/motion** — Motion library docs
- **useAnimations.com** — Icon animations
- **lottiefiles.com** — Lottie animations

### Типографіка
- **fonts.google.com** — Шрифти
- **typescale.com** — Scale calculator
- **fontpair.co** — Font combinations

---

## 10. Швидкі посилання

| Категорія | Сайт | Що дивитись |
|-----------|------|-------------|
| Шини | michelin.com | Hero, Product finder |
| Шини | continental-tires.com | Dark theme, Cards |
| Premium | apple.com | Typography, Animation |
| Premium | porsche.com | Dark luxury, Video |
| E-commerce | canyon.com | Product cards, Filters |
| Tech UI | linear.app | Dark mode, Glass effects |
| Tech UI | vercel.com | Gradients, Footer |
| Payments | stripe.com | Colors, Trust elements |
