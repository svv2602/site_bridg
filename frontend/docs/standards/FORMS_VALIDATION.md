# Формы и Валидация

**Версия:** 1.0
**Дата:** 2026-01-11

---

## Базовые Компоненты Форм

### Input

```typescript
interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function Input({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required,
  className,
}: InputProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5',
          'bg-background text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'transition-colors',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border hover:border-stone-400'
        )}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

### Select

```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function Select({
  label,
  name,
  options,
  placeholder = 'Оберіть...',
  error,
  required,
  className,
}: SelectProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'transition-colors appearance-none',
          'bg-[url("data:image/svg+xml,...")]', // chevron icon
          error
            ? 'border-red-500'
            : 'border-border hover:border-stone-400'
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Textarea

```typescript
interface TextareaProps {
  label: string;
  name: string;
  rows?: number;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

function Textarea({
  label,
  name,
  rows = 4,
  placeholder,
  error,
  required,
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary',
          'resize-y min-h-[100px]',
          error ? 'border-red-500' : 'border-border'
        )}
      />
      {error && (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      )}
    </div>
  );
}
```

---

## Валидация

### Client-Side Validation

```typescript
"use client";

import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = "Ім'я обов'язкове";
  } else if (data.name.length < 2) {
    errors.name = "Ім'я занадто коротке";
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = "Email обов'язковий";
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Невірний формат email';
  }

  // Phone validation (Ukraine format)
  const phoneRegex = /^\+?38?\s?0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
  if (data.phone && !phoneRegex.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Невірний формат телефону';
  }

  return errors;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Submit failed');
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Ім'я"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
      />

      <Input
        label="Телефон"
        name="phone"
        type="tel"
        placeholder="+380 XX XXX XX XX"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'w-full rounded-full bg-primary px-6 py-3',
          'font-semibold text-white',
          'hover:bg-primary/90 transition-colors',
          'disabled:opacity-70 disabled:cursor-not-allowed'
        )}
      >
        {isSubmitting ? 'Відправка...' : 'Відправити'}
      </button>

      {submitStatus === 'success' && (
        <p className="text-green-600 text-center">
          Дякуємо! Ваше повідомлення відправлено.
        </p>
      )}
      {submitStatus === 'error' && (
        <p className="text-red-500 text-center">
          Помилка відправки. Спробуйте пізніше.
        </p>
      )}
    </form>
  );
}
```

---

## Паттерны Форм

### Форма Поиска Шин

```typescript
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface TyreSearchFormData {
  width: string;
  profile: string;
  diameter: string;
  season: string;
}

const WIDTHS = ['185', '195', '205', '215', '225', '235', '245'];
const PROFILES = ['45', '50', '55', '60', '65', '70'];
const DIAMETERS = ['15', '16', '17', '18', '19', '20'];
const SEASONS = [
  { value: 'summer', label: 'Літні' },
  { value: 'winter', label: 'Зимові' },
  { value: 'all-season', label: 'Всесезонні' },
];

export function TyreSearchForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<TyreSearchFormData>({
    width: '',
    profile: '',
    diameter: '',
    season: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (formData.width) params.set('width', formData.width);
    if (formData.profile) params.set('profile', formData.profile);
    if (formData.diameter) params.set('diameter', formData.diameter);
    if (formData.season) params.set('season', formData.season);

    router.push(`/tyre-search?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <select
          name="width"
          value={formData.width}
          onChange={handleChange}
          className="rounded-lg border border-border bg-background px-4 py-2.5"
        >
          <option value="">Ширина</option>
          {WIDTHS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        <select
          name="profile"
          value={formData.profile}
          onChange={handleChange}
          className="rounded-lg border border-border bg-background px-4 py-2.5"
        >
          <option value="">Профіль</option>
          {PROFILES.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          name="diameter"
          value={formData.diameter}
          onChange={handleChange}
          className="rounded-lg border border-border bg-background px-4 py-2.5"
        >
          <option value="">Діаметр</option>
          {DIAMETERS.map(d => (
            <option key={d} value={d}>R{d}</option>
          ))}
        </select>

        <select
          name="season"
          value={formData.season}
          onChange={handleChange}
          className="rounded-lg border border-border bg-background px-4 py-2.5"
        >
          <option value="">Сезон</option>
          {SEASONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-white
                   flex items-center justify-center gap-2
                   hover:bg-primary/90 transition-colors"
      >
        <Search className="h-5 w-5" />
        Знайти шини
      </button>
    </form>
  );
}
```

---

## Правила Валидации

### Телефон (Украина)

```typescript
// Форматы:
// +380 XX XXX XX XX
// 0XX XXX XX XX
// 380XXXXXXXXX

const PHONE_REGEX = /^(\+?38)?0\d{9}$/;

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+38 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  if (digits.length === 12 && digits.startsWith('38')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone;
}
```

### Email

```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | undefined {
  if (!email) return "Email обов'язковий";
  if (!EMAIL_REGEX.test(email)) return 'Невірний формат email';
  return undefined;
}
```

### Размер Шин

```typescript
interface TyreSize {
  width: number;
  profile: number;
  diameter: number;
}

function validateTyreSize(size: string): TyreSize | null {
  // Format: 205/55R16
  const regex = /^(\d{3})\/(\d{2})R(\d{2})$/;
  const match = size.match(regex);

  if (!match) return null;

  return {
    width: parseInt(match[1]),
    profile: parseInt(match[2]),
    diameter: parseInt(match[3]),
  };
}
```

---

## Состояния Формы

### Loading State

```typescript
<button disabled={isSubmitting} className="...">
  {isSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Відправка...
    </>
  ) : (
    'Відправити'
  )}
</button>
```

### Success State

```typescript
{submitStatus === 'success' && (
  <div className="rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
    <CheckCircle className="inline h-5 w-5 mr-2" />
    Форму успішно відправлено!
  </div>
)}
```

### Error State

```typescript
{submitStatus === 'error' && (
  <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
    <AlertCircle className="inline h-5 w-5 mr-2" />
    Помилка відправки. Спробуйте ще раз.
  </div>
)}
```

---

## Чеклист Форм

- [ ] Все поля имеют `label` с `htmlFor`
- [ ] Required поля отмечены визуально
- [ ] Ошибки отображаются под полями
- [ ] `aria-invalid` на полях с ошибками
- [ ] `aria-describedby` связывает поле с ошибкой
- [ ] Кнопка `disabled` при отправке
- [ ] Loading индикатор при отправке
- [ ] Success/Error сообщения после отправки
- [ ] Валидация на клиенте перед отправкой

---

## Связанные Документы

- [Структура Компонентов](./COMPONENT_STRUCTURE.md)
- [Кнопки](./BUTTON_STANDARDS.md)
- [Accessibility](./ACCESSIBILITY.md)
- [TypeScript Стандарты](./TYPESCRIPT_STANDARDS.md)
