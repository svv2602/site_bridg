# Фаза 5: Admin UI

## Статус
- [ ] Не розпочата
- [ ] В процесі
- [ ] Завершена

**Розпочата:** -
**Завершена:** -

## Ціль фази
Створити сторінку в адмінці для генерації контенту з превью, редагуванням та публікацією.

## Передумови
- Завершена Фаза 4 (Backend API)
- Frontend працює на localhost:3010

## Задачі

### 5.0 ОБОВ'ЯЗКОВО: Аналіз та планування

#### A. Аналіз існуючого коду
- [ ] Вивчити існуючі admin сторінки в `frontend/src/app/admin/`
- [ ] Вивчити патерни компонентів (cards, tables, buttons)
- [ ] Знайти приклади форм та API викликів

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
- [ ] Які компоненти можна перевикористати?
- [ ] Чи потрібен rich text editor для превью?
- [ ] Як реалізувати порівняння старого/нового контенту?

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

**Нотатки для перевикористання:** -

---

### 5.1 Створити базову структуру сторінки
- [ ] Створити папку `frontend/src/app/admin/content-generation/`
- [ ] Створити `page.tsx` з базовою розміткою
- [ ] Додати захист автентифікацією
- [ ] Додати layout з заголовком

**Файли:** `frontend/src/app/admin/content-generation/page.tsx`
**Нотатки:** -

---

### 5.2 Створити компонент ModelSelector
- [ ] Завантажувати список моделей шин з API
- [ ] Відображати select/dropdown
- [ ] Показувати статус контенту для кожної моделі
- [ ] Фільтрувати: всі / без контенту / з контентом

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
- [ ] Кнопка "Генерувати контент"
- [ ] Кнопка "Переглянути превью"
- [ ] Кнопка "Опублікувати"
- [ ] Стан завантаження для кожної дії
- [ ] Індикатор прогресу генерації

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
- [ ] Режим side-by-side (поточний vs згенерований)
- [ ] Підсвітка змін (diff)
- [ ] Відображення rich text як HTML
- [ ] Редагування згенерованого контенту
- [ ] Чекбокси для вибору полів публікації

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
- [ ] Список питань/відповідей
- [ ] Можливість додавати/видаляти FAQ
- [ ] Можливість редагувати
- [ ] Drag & drop для порядку

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
- [ ] Список переваг
- [ ] Можливість додавати/видаляти
- [ ] Можливість редагувати
- [ ] Обмеження 4-6 пунктів

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
- [ ] Hook `useContentGeneration` для API операцій
- [ ] Стан: loading, error, data
- [ ] Функції: generate, preview, publish
- [ ] Polling для статусу генерації

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

### 5.8 Тестування Admin UI
- [ ] Перевірити вибір моделі
- [ ] Перевірити генерацію контенту
- [ ] Перевірити превью та редагування
- [ ] Перевірити публікацію
- [ ] Перевірити обробку помилок

**URL:** `http://localhost:3010/admin/content-generation`
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
   git commit -m "feat(frontend): admin UI for content generation"
   ```
5. Онови PROGRESS.md:
   - Поточна фаза: 6
   - Додай запис в історію
6. Відкрий наступну фазу (phase-06-frontend-display.md)
