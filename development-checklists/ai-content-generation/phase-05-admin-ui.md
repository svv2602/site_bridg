# Фаза 5: Admin UI

## Статус
- [x] Не розпочата
- [x] В процесі
- [x] Завершена

**Розпочата:** 2026-01-10
**Завершена:** 2026-01-10

## Ціль фази
Створити сторінку в адмінці для генерації контенту з превью, редагуванням та публікацією.

## Передумови
- Завершена Фаза 4 (Backend API)
- Frontend працює на localhost:3010

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [x] Вивчити існуючі admin сторінки в `frontend/src/app/admin/`
- [x] Вивчити патерни компонентів (cards, tables, buttons)
- [x] Знайти приклади форм та API викликів

**Команди для пошуку:**
```bash
# Існуючі admin сторінки
ls frontend/src/app/admin/
# Компоненти admin
ls frontend/src/components/admin/
# Патерни API викликів
grep -r "fetch\|useSWR" frontend/src/app/admin/
```

#### B. Аналіз залежностей
- [x] Які компоненти можна перевикористати?
- [x] Чи потрібен rich text editor для превью?
- [x] Як реалізувати порівняння старого/нового контенту?

**Компоненти для перевикористання:**
- StatCard з automation сторінки
- Table компоненти
- Button стилі

#### C. Планування UI

```
┌─────────────────────────────────────────────┐
│ AI Content Generation                        │
├─────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│ │ Models  │ │Generated│ │Published│         │
│ │   11    │ │    3    │ │    1    │         │
│ └─────────┘ └─────────┘ └─────────┘         │
├─────────────────────────────────────────────┤
│ Select model: [Turanza 6        ▼]          │
│                                             │
│ [Generate Content] [View Preview] [Publish] │
├─────────────────────────────────────────────┤
│ Preview                                      │
│ ┌─────────────────┬─────────────────┐       │
│ │ Current         │ Generated       │       │
│ │ (empty)         │ SEO title...    │       │
│ │                 │ Description...  │       │
│ └─────────────────┴─────────────────┘       │
└─────────────────────────────────────────────┘
```

**Нотатки для перевикористання:** Reused StatCard pattern from automation page

---

### 5.1 Створити базову структуру сторінки
- [x] Створити папку `frontend/src/app/admin/content-generation/`
- [x] Створити `page.tsx` з базовою розміткою
- [x] Додати захист автентифікацією
- [x] Додати layout з заголовком

**Файли:** `frontend/src/app/admin/content-generation/page.tsx`
**Нотатки:** Added navigation link in admin layout

---

### 5.2 Створити компонент ModelSelector
- [x] Завантажувати список моделей шин з API
- [x] Відображати select/dropdown
- [x] Показувати статус контенту для кожної моделі
- [x] Фільтрувати: всі / без контенту / з контентом

**Файли:** `frontend/src/components/admin/ModelSelector.tsx`
**Props:**
```typescript
interface ModelSelectorProps {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  filter?: 'all' | 'no-content' | 'has-content';
}
```

---

### 5.3 Створити компонент GenerationControls
- [x] Кнопка "Генерувати контент"
- [x] Кнопка "Переглянути превью"
- [x] Кнопка "Опублікувати"
- [x] Стан завантаження для кожної дії
- [x] Індикатор прогресу генерації

**Файли:** `frontend/src/components/admin/GenerationControls.tsx`
**Props:**
```typescript
interface GenerationControlsProps {
  modelSlug: string;
  status: ContentStatus;
  onGenerate: () => void;
  onPublish: () => void;
  isGenerating: boolean;
  isPublishing: boolean;
}
```

---

### 5.4 Створити компонент ContentPreview
- [x] Режим side-by-side (поточний vs згенерований)
- [x] Підсвітка змін (diff)
- [x] Відображення rich text як HTML
- [x] Редагування згенерованого контенту
- [x] Чекбокси для вибору полів публікації

**Файли:** `frontend/src/components/admin/ContentPreview.tsx`
**Props:**
```typescript
interface ContentPreviewProps {
  current: Partial<TyreContent>;
  generated: TyreContent;
  selectedFields: string[];
  onFieldToggle: (field: string) => void;
  onEdit: (field: string, value: any) => void;
}
```

---

### 5.5 Створити компонент FAQEditor
- [x] Список питань/відповідей
- [x] Можливість додавати/видаляти FAQ
- [x] Можливість редагувати
- [x] Drag & drop для порядку

**Файли:** `frontend/src/components/admin/FAQEditor.tsx`
**Props:**
```typescript
interface FAQEditorProps {
  faqs: { question: string; answer: string }[];
  onChange: (faqs: { question: string; answer: string }[]) => void;
}
```

---

### 5.6 Створити компонент BenefitsEditor
- [x] Список переваг
- [x] Можливість додавати/видаляти
- [x] Можливість редагувати
- [x] Обмеження 4-6 пунктів

**Файли:** `frontend/src/components/admin/BenefitsEditor.tsx`
**Props:**
```typescript
interface BenefitsEditorProps {
  benefits: string[];
  onChange: (benefits: string[]) => void;
  maxItems?: number;
}
```

---

### 5.7 Інтегрувати API виклики
- [x] Hook `useContentGeneration` для API операцій
- [x] Стан: loading, error, data
- [x] Функції: generate, preview, publish
- [x] Polling для статусу генерації

**Файли:** `frontend/src/hooks/useContentGeneration.ts`
**API:**
```typescript
interface UseContentGenerationReturn {
  status: ContentStatus | null;
  preview: ContentPreview | null;
  isLoading: boolean;
  error: Error | null;
  generate: (modelSlug: string) => Promise<void>;
  publish: (modelSlug: string, fields: string[]) => Promise<void>;
  refresh: () => void;
}
```

---

### 5.8 Тестування Admin UI - відкладено до Phase 7
- [ ] Перевірити вибір моделі → Phase 7
- [ ] Перевірити генерацію контенту → Phase 7
- [ ] Перевірити превью та редагування → Phase 7
- [ ] Перевірити публікацію → Phase 7
- [ ] Перевірити обробку помилок → Phase 7

**URL:** `http://localhost:3010/admin/content-generation`
**Нотатки:** UI testing deferred to integration phase

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
   git commit -m "feat(frontend): admin UI for content generation"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
6. Відкрий наступну фазу (phase-06-frontend-display.md)
