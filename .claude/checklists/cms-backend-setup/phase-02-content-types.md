# Фаза 2: Моделі даних (Content Types)

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити всі content types відповідно до типів з frontend/src/lib/data.ts.

## Задачі

### 2.0 ОБОВ'ЯЗКОВО: Аналіз типів

#### Mapping типів → Content Types:
```typescript
// TyreModel → Content Type "Tyre"
{
  slug: string (unique)
  name: string
  season: enum [summer, winter, allseason]
  vehicleTypes: enum[] [passenger, suv, lcv]
  isNew: boolean
  isPopular: boolean
  shortDescription: text
  euLabel: component {wetGrip, fuelEfficiency, noiseDb}
  sizes: relation (one-to-many) → TyreSize
  usage: component {city, highway, offroad, winter}
  technologies: relation (many-to-many) → Technology
  image: media
}

// Dealer → Content Type "Dealer"
{
  name: string
  type: enum [official, partner, service]
  city: string
  address: string
  latitude: decimal
  longitude: decimal
  phone: string
  website: string
  workingHours: string
}

// Article → Content Type "Article"
{
  slug: string (unique)
  title: string
  subtitle: string
  previewText: text
  body: rich text
  readingTimeMinutes: integer
  publishedAt: datetime
  tags: json array
  seoTitle: string
  seoDescription: text
  image: media
}

// Technology → Content Type "Technology"
{
  slug: string (unique)
  name: string
  description: text
  icon: string
  tyres: relation (many-to-many) → Tyre
}

// VehicleFitment → Content Type "VehicleFitment"
{
  make: string
  model: string
  bodyType: string
  yearFrom: integer
  yearTo: integer
  recommendedSizes: json / relation
}
```

---

### 2.1 Content Type: Tyre
- [ ] Створити content type "Tyre"
- [ ] Додати всі поля згідно mapping
- [ ] Створити component "EuLabel"
- [ ] Створити component "TyreUsage"
- [ ] Налаштувати relation з Technology

**Файли:** CMS admin panel
**Нотатки:** -

---

### 2.2 Content Type: Dealer
- [ ] Створити content type "Dealer"
- [ ] Додати всі поля
- [ ] Додати validation для coordinates

**Файли:** CMS admin panel
**Нотатки:** -

---

### 2.3 Content Type: Article
- [ ] Створити content type "Article"
- [ ] Додати rich text editor для body
- [ ] Налаштувати SEO поля

**Файли:** CMS admin panel
**Нотатки:** -

---

### 2.4 Content Type: Technology
- [ ] Створити content type "Technology"
- [ ] Налаштувати many-to-many з Tyre

**Файли:** CMS admin panel
**Нотатки:** -

---

### 2.5 Content Type: VehicleFitment
- [ ] Створити content type "VehicleFitment"
- [ ] Визначити формат зберігання recommendedSizes

**Файли:** CMS admin panel
**Нотатки:** -

---

### 2.6 Імпорт mock даних
- [ ] Імпортувати MOCK_TYRE_MODELS
- [ ] Імпортувати MOCK_DEALERS
- [ ] Імпортувати MOCK_ARTICLES
- [ ] Імпортувати MOCK_TECHNOLOGIES

**Файли:** -
**Нотатки:** Можна написати seed script

---

## При завершенні фази

1. Убедись, що всі задачі відмічені [x]
2. Виконай коміт:
   ```bash
   git add .
   git commit -m "checklist(cms): phase-2 content types completed"
   ```
3. Онови PROGRESS.md
4. Відкрий phase-03-api-integration.md
