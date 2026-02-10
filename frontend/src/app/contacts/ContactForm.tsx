"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "@/lib/schemas/contact";

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bot detection: record page load timestamp
  const loadedAtRef = useRef<number>(0);
  useEffect(() => {
    loadedAtRef.current = Date.now();
  }, []);

  // Auto-reset form after success (5 seconds)
  const resetForm = useCallback(() => {
    setStatus('idle');
    setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
    setConsent(false);
    setErrorMessage('');
    setFieldErrors({});
  }, []);

  // Focus management on status change + auto-reset on success
  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus();
      autoResetTimerRef.current = setTimeout(resetForm, 5000);
    } else if (status === 'error') {
      errorRef.current?.focus();
    }
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
        autoResetTimerRef.current = null;
      }
    };
  }, [status, resetForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMessage('');

    // Client-side Zod validation
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string' && !errors[field]) {
          errors[field] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    // GDPR consent validation
    if (!consent) {
      setFieldErrors(prev => ({
        ...prev,
        consent: 'Необхідна згода на обробку персональних даних',
      }));
      return;
    }

    setStatus('loading');

    // Read honeypot value from the form
    const honeypotValue = formRef.current?.querySelector<HTMLInputElement>('[name="_hp_website"]')?.value || '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          _loadedAt: loadedAtRef.current,
          _hp_website: honeypotValue,
          consent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Помилка відправки');
      }

      setStatus('success');
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setConsent(false);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Щось пішло не так');
    }
  };

  return (
    <div
      className="rounded-2xl border border-border bg-card p-8 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold">Надішліть нам повідомлення</h2>
      <p className="mb-8 text-muted-foreground">
        Заповніть форму, і наші фахівці зв&apos;яжуться з вами найближчим часом.
      </p>

      {status === 'success' ? (
        <div ref={successRef} tabIndex={-1} className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-900 dark:bg-green-950 outline-none">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-4 text-xl font-semibold text-green-800 dark:text-green-200">
            Дякуємо за звернення!
          </h3>
          <p className="mt-2 text-green-700 dark:text-green-300">
            Ваше повідомлення отримано. Ми зв&apos;яжемося з вами протягом 24 годин.
          </p>
          <button
            onClick={resetForm}
            className="mt-4 rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700"
          >
            Надіслати ще одне
          </button>
        </div>
      ) : (
        <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} noValidate>
          {status === 'error' && (
            <div
              ref={errorRef}
              id="form-error"
              role="alert"
              tabIndex={-1}
              className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950 outline-none"
            >
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Honeypot field — hidden from real users, bots will fill it */}
          <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
            <label htmlFor="hp_website">Website</label>
            <input
              type="text"
              id="hp_website"
              name="_hp_website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">Ім&apos;я *</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : status === 'error' ? 'form-error' : undefined}
                value={formData.name}
                onChange={handleChange}
                disabled={status === 'loading'}
                className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${fieldErrors.name ? 'border-red-500' : 'border-border'}`}
                placeholder="Ваше ім'я"
              />
              {fieldErrors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">Телефон *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
                value={formData.phone}
                onChange={handleChange}
                disabled={status === 'loading'}
                className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${fieldErrors.phone ? 'border-red-500' : 'border-border'}`}
                placeholder="+380 (__) ___ __ __"
              />
              {fieldErrors.phone && (
                <p id="phone-error" className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">Електронна пошта *</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              value={formData.email}
              onChange={handleChange}
              disabled={status === 'loading'}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${fieldErrors.email ? 'border-red-500' : 'border-border'}`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium">Тема звернення</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              disabled={status === 'loading'}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="">Оберіть тему</option>
              <option value="tyre-selection">Питання щодо вибору шин</option>
              <option value="find-dealer">Пошук дилера / де купити</option>
              <option value="warranty">Гарантія та сервіс</option>
              <option value="other">Інше запитання</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium">Повідомлення *</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              aria-required="true"
              aria-invalid={!!fieldErrors.message}
              aria-describedby={fieldErrors.message ? 'message-error' : undefined}
              value={formData.message}
              onChange={handleChange}
              disabled={status === 'loading'}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${fieldErrors.message ? 'border-red-500' : 'border-border'}`}
              placeholder="Опишіть ваше запитання або ситуацію..."
            />
            {fieldErrors.message && (
              <p id="message-error" className="mt-1 text-xs text-red-500">{fieldErrors.message}</p>
            )}
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                if (fieldErrors.consent) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.consent;
                    return next;
                  });
                }
              }}
              disabled={status === 'loading'}
              aria-invalid={!!fieldErrors.consent}
              aria-describedby={fieldErrors.consent ? 'consent-error' : undefined}
              className="mt-1 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/20 disabled:opacity-50"
            />
            <label htmlFor="consent" className="text-sm text-muted-foreground">
              Я погоджуюся на обробку персональних даних відповідно до{' '}
              <Link href="/privacy" className="text-primary underline hover:text-primary/80">
                Політики конфіденційності
              </Link>
            </label>
          </div>
          {fieldErrors.consent && (
            <p id="consent-error" className="text-xs text-red-500">{fieldErrors.consent}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={status === 'loading'}
            className="w-full py-3.5 text-lg shadow-lg"
          >
            {status === 'loading' ? 'Надсилаємо...' : 'Надіслати запит'}
          </Button>
        </form>
      )}
    </div>
  );
}
